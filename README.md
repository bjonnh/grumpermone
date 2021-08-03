# Talk to grumpermon

You too can talk to grumpermon. Grumpermon is a really clever IRC bot fed with really deep knowledge about the world.
With this service, your speech will be recognized and transformed to text (using Chrome/Chromium API) for grumpermon to
understand. The replies from grumpermon will then be transformed to speech by Google Cloud Text to Speech API.

You will need a service Google cloud account in a new project, and for you to create a key that you save as credentials.json.
Follow the instructions at:  https://cloud.google.com/docs/authentication/getting-started

run with

```shell
npm install 
npm run dev
```

Or you can run that in a docker if you are concerned:

```shell
docker build -t grumpermone .
docker run -p 8080:8080 -it grumpermone
```

You can now access it at http://localhost:8080 using Chrome or Chromium (for now it uses their Speech recognition)

Click on start, talk, then click on stop (this may get automated as well if I dare).

