import {config} from "dotenv";

config();

import {TextToSpeechClient} from "@google-cloud/text-to-speech/build/src/v1";
import {google} from "@google-cloud/text-to-speech/build/protos/protos";
import ISynthesizeSpeechRequest = google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

const client = new TextToSpeechClient();

const request: ISynthesizeSpeechRequest = {
    // The text to synthesize
    input: {
        text: 'This is an example'
    },

    // The language code and SSML Voice Gender
    voice: {
        languageCode: 'en-US',
        ssmlGender: 'NEUTRAL'
    },

    // The audio encoding type
    audioConfig: {
        audioEncoding: 'MP3'
    },
};

export async function textToAudioBuffer(text: string): Promise<Uint8Array | string> {
    request.input.text = text; // text or SSML
    const response = await client.synthesizeSpeech(request);
    return response[0].audioContent;
}
