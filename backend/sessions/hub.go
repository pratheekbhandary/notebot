package sessions

// Hub maintains the set of active session
type Hub struct {
	// Registered session.
	sessions map[*Session]bool

	// Register requests from the session.
	Register chan *Session

	// Unregister requests from session.
	Unregister chan *Session
}

// NewHub ...
func NewHub() *Hub {
	return &Hub{
		Register:   make(chan *Session),
		Unregister: make(chan *Session),
		sessions:    make(map[*Session]bool),
	}
}

// DoesSessionExists checks if the give session already exists
func (hub *Hub) DoesSessionExists(sessionPtr *Session) bool {
	_, ok:= hub.sessions[sessionPtr]
	return ok
}

// Run ...
func (hub *Hub) Run() {
	for {
		select {
		case session := <-hub.Register:
			hub.sessions[session] = true
		case session := <-hub.Unregister:
			if _, ok := hub.sessions[session]; ok {
				delete(hub.sessions, session)
				close(session.Send)
			}
		}
	}
}