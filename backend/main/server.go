package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/pratheekbhandary/notebot/backend/sessions"
)

var sessionCounter int
func main() {
	flag.Parse()
	log.SetFlags(0)

	hub := sessions.NewHub()
	go hub.Run()

	http.HandleFunc("/session", func(w http.ResponseWriter, r *http.Request) {
		sessionHandler(hub, w, r)
	})
	http.HandleFunc("/ping", pingHandler)
	log.Fatal(http.ListenAndServe(":4040", nil))
}

func pingHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Write([]byte("healthy"))
}

var upgrader = websocket.Upgrader{} // use default options

func sessionHandler(hub *sessions.Hub, w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	log.Printf("New connection upgraded to WebSocket protocol! Creating new session...")
	// Make new session and register that session into hub
	session := sessions.NewSession(hub,c,sessionCounter)
	sessionCounter++
	go session.WritePump()
	go session.ReadPump()
}