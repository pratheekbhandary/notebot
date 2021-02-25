package sessions

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	speech "cloud.google.com/go/speech/apiv1"
	speechpb "google.golang.org/genproto/googleapis/cloud/speech/v1"
)

// LiveCaption specifies the stream recognizer to communicate with google speach api
type LiveCaption struct {
	stream *speechpb.Speech_StreamingRecognizeClient
	session *Session
}

// NewLiveCaption generates new livestream 
func NewLiveCaption(session *Session) *LiveCaption {
	lc:=&LiveCaption{
		stream: newStream(),
		session: session,
	}
	go lc.streamListenerGenerator()
	return lc
}

// NewStream configures Google STT and generates new stt stream
func newStream() *speechpb.Speech_StreamingRecognizeClient {
	ctx := context.Background()

	client, err := speech.NewClient(ctx)
	if err != nil {
		log.Fatal(err)
	}
	stream, err := client.StreamingRecognize(ctx)
	if err != nil {
		log.Fatal(err)
	}
	// Send the initial configuration message.
	if err := stream.Send(&speechpb.StreamingRecognizeRequest{
		StreamingRequest: &speechpb.StreamingRecognizeRequest_StreamingConfig{
			StreamingConfig: &speechpb.StreamingRecognitionConfig{
				Config: &speechpb.RecognitionConfig{
					Encoding:        speechpb.RecognitionConfig_LINEAR16,
					SampleRateHertz: 16000,
					LanguageCode:    "en-IN",
					DiarizationConfig: &speechpb.SpeakerDiarizationConfig{
						EnableSpeakerDiarization: true,
					},		
				},
				InterimResults: true,
			},
		},
	}); err != nil {
		log.Fatal(err)
	}
	return &stream
}



// SendAudioBytesToSTT method send the give audio bytes to google
func (livecap *LiveCaption) sendAudioBytesToSTT(buf []byte) error {
	if livecap.stream == nil {
		return fmt.Errorf("stream is empty")
	}
	n := len(buf)
	if n > 0 {
		if err := (*livecap.stream).Send(&speechpb.StreamingRecognizeRequest{
			StreamingRequest: &speechpb.StreamingRecognizeRequest_AudioContent{
				AudioContent: buf[:n],
			},
			}); err != nil {
				log.Printf("Could not send audio: %v", err)
				} else {
					log.Printf("audio bytes sent to google")
				}
			}
			return nil	
		}

// streamListenerGenerator generates new stream after deadline and
// spins up routine to listen for transcribed messages
func (livecap *LiveCaption) streamListenerGenerator() {
			ticker := time.NewTicker(300 * time.Second)
			sttResponse:= make(chan *speechpb.StreamingRecognizeResponse)
			go livecap.listenForTrascribedMessagesFromSTT(sttResponse)
			defer func() {
				log.Printf("streamListenerGenerator is getting closed")
				ticker.Stop()
				if err:=(*livecap.stream).CloseSend(); err != nil {
					log.Printf("Could not close stream: %v", err)
				}
			}()
			for {
				select {
				case resp :=<- sttResponse:
					for _, result := range resp.Results {
						jbytes,_ := json.MarshalIndent(result," ","		")
						fmt.Printf("Result: %+v\n", string(jbytes))
					}
				case <- ticker.C:
					log.Printf("300 sec elapsed, creating new stream")
					livecap.stream = newStream()
				}
			}
		}

// listenForTrascribedMessagesFromSTT listens and prints the transcribed messages from google
func (livecap *LiveCaption) listenForTrascribedMessagesFromSTT(sttResponse chan *speechpb.StreamingRecognizeResponse)  {
	defer func() {
		log.Printf("closing listenForTrascribedMessagesFromSTT")
	}()	
	for {
		log.Printf("listening listenForTrascribedMessagesFromSTT")
		if livecap.stream == nil {
			log.Printf("live caption stream is nil")
			continue 
		}
		resp, err := (*livecap.stream).Recv()
		if err == io.EOF {
			log.Printf("reached EOF")
			break
		}
		if err != nil {
			log.Fatalf("Cannot stream results: %v", err)
		}
		if err := resp.Error; err != nil {
			// Workaround while the API doesn't give a more informative error.
			if err.Code == 3 || err.Code == 11 {
				log.Print("WARNING: Speech recognition request exceeded limit of 305 seconds.")
			}
			log.Fatalf("Could not recognize: %v", err)
		}
		log.Printf("listenForTrascribedMessagesFromSTT got a message")
		sttResponse <- resp
	}
}