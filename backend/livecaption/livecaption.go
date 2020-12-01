package livecaption

import (
	"context"
	"fmt"
	"io"
	"log"

	speech "cloud.google.com/go/speech/apiv1"
	speechpb "google.golang.org/genproto/googleapis/cloud/speech/v1"
)

// LiveCaption specifies the stream recognizer to communicate with google speach api
type LiveCaption struct {
	stream speechpb.Speech_StreamingRecognizeClient
}

// NewLiveCaptionStream configures Google STT and generates new LiveCaption instance
func NewLiveCaptionStream() *LiveCaption {
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
					LanguageCode:    "en-US",
					DiarizationConfig: &speechpb.SpeakerDiarizationConfig{
						EnableSpeakerDiarization: true,
					},
				},
			},
		},
	}); err != nil {
		log.Fatal(err)
	}
	return &LiveCaption{
		stream: stream,
	}
}

// SendAudioBytesToGoogle method send the give audio bytes to google
func (livecap *LiveCaption) SendAudioBytesToGoogle(buf []byte) {
		n := len(buf)
		if n > 0 {
			if err := livecap.stream.Send(&speechpb.StreamingRecognizeRequest{
				StreamingRequest: &speechpb.StreamingRecognizeRequest_AudioContent{
					AudioContent: buf[:n],
				},
			}); err != nil {
				log.Printf("Could not send audio: %v", err)
			}
		}
		
	}

// ListenForTrascribedMessagesFromGoogle listens and prints the transcribed messages from google
func (livecap *LiveCaption) ListenForTrascribedMessagesFromGoogle() {
	for {
		resp, err := livecap.stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("Cannot stream results: %v", err)
		}
		if err := resp.Error; err != nil {
			// Workaround while the API doesn't give a more informative error.
			if err.Code == 3 || err.Code == 11 {
				log.Print("WARNING: Speech recognition request exceeded limit of 60 seconds.")
			}
			log.Fatalf("Could not recognize: %v", err)
		}
		for _, result := range resp.Results {
			fmt.Printf("Result: %+v\n", result)
		}
	}
}