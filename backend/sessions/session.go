package sessions

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/speps/go-hashids"
)

// session constants
const(
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
	  
)

// CommandTypes
const (
	// Audio packet sent forward it to stt
	streamAudio="STREAM_AUDIO"
	// On successfull websocket connection
	onConnection="ON_CONNECTION"
	// On connection close
	onCloseConnection="ON_CLOSE_CONNECTION"
)

// SocketMessage are the message formats from ui
type SocketMessage struct {
		Command string 
		Data []byte 
}

// Session is started when first user connects to it the server
// a unique session Id is given to it.
type Session struct {
	id int
	authToken string
	hub *Hub
    conn *websocket.Conn
	liveCaption *LiveCaption
	// Buffered channel of outbound messages.
	Send chan []byte
}

// NewSession generates new session for each client on a new connection
// it stores hub and connection and registers the connection into the HUB
func NewSession(hub *Hub, conn *websocket.Conn,id int) *Session {
	session := &Session{hub: hub, conn: conn, Send: make(chan []byte, 256),id:id}
	session.hub.Register <- session
	return session
}

// ReadPump pumps messages from the websocket connection to the corresponding livecaption channel.
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
// SetReadDeadline sets a initial deadline for this reader and 
// SetPongHandler keeps extending it till the pings come flowing
func (session *Session) ReadPump() {
	defer func() {
		session.hub.Unregister <- session
		session.conn.Close()
	}()
	// session.conn.SetReadLimit(maxMessageSize)
	session.conn.SetReadDeadline(time.Now().Add(pongWait))
	session.conn.SetPongHandler(func(string) error {
		session.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil;
	})

	for {
		_, message, err := session.conn.ReadMessage()
		if err != nil {
			// TODO: [Research]
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		clientMessage := &SocketMessage{}
		json.Unmarshal(message,clientMessage)
		switch clientMessage.Command {
		case onConnection:
			//Init hi 
			log.Printf("Successfully connected to a client %d",session.id)
		case streamAudio:
			if session.liveCaption == nil {
				session.liveCaption = NewLiveCaption(session)
				log.Printf("Creating new live caption %d",session.id)
			}
			if err:=session.liveCaption.sendAudioBytesToSTT(clientMessage.Data); err != nil{
				log.Printf("error: %v", err)
			}
		case onCloseConnection:
			session.hub.Unregister <- session
			session.conn.Close()
			log.Printf("Closing ties with client %d",session.id)
		default:
			log.Printf("Client message received but command %s not found",clientMessage.Command)
		}
	}
}

// WritePump pumps messages from the google STT to the websocket connection.
// forwards any message comming to session's send channel to the websocket connection
func (session *Session) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		session.conn.Close()
	}()

	for {
		select {
			case message, ok := <-session.Send:
				session.conn.SetWriteDeadline(time.Now().Add(writeWait))
				if !ok {
					// The hub closed the channel.
					session.conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}
				w, err := session.conn.NextWriter(websocket.TextMessage)
				if err != nil {
					return
				}
				w.Write(message)
				if err := w.Close(); err != nil {
					return
				}
			case <-ticker.C:
				session.conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := session.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
		}
	}
}


func makeTimestamp() int64 {
	return time.Now().UnixNano() / int64(time.Second)
}

func newHashID() string {
	var hd = hashids.NewData()
	hd.Salt = "Some SAlt"
	h, err := hashids.NewWithData(hd)
	if err != nil {
		log.Println("handling error::::", err)
	}
	now := time.Now()
	year := now.Year()
	month := int(now.Month())
	day := now.Day()
	hour := now.Hour()
	minute := now.Minute()
	second := now.Second()
	id, _ := h.Encode([]int{year, month, day, hour, minute, second})
	return id
}

