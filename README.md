<p align="center">
  <img width="40%" src="surang.png" alt="Surang logo"/>
</p>

A self-hostable WebSocket based tunneling solution to expose your localhost. :rocket:

> This is Surang client repository.
> Check out [surang-server](https://github.com/RathiRohit/surang-server) for server code.

Surang allows you to expose your localhost server to the world through WebSocket based
one-to-one tunnel. Surang is created to be easy to host on most of the hosting
platforms that support NodeJS (read more at [How is Surang different from localtunnel?]()).

Note: There are no public Surang servers (and there cannot be as surang-server only
supports one client at a time for now.) You are supposed to host your own
[surang-server](https://github.com/RathiRohit/surang-server). (PS: It's as simple as
a single mouse click.)

# Installation

### 1. Host your surang-server:

Head over to [surang-server](https://github.com/RathiRohit/surang-server) repository
for step-by-step instructions on hosting your surang-server.

### 2. Install surang client:

```
npm install -g surang
```

# CLI usage

#### Configure surang:

```
surang config
```
This will configure your Surang client for once and all, so that you don't have to
pass command line options every time. (You can run this again to update global
configuration if needed.)

#### Start:

```
surang start --port 8000
```
As you guessed, this will connect to configured surang-server and start tunneling
traffic to your local server on given port.

---

### Additional command line options:

Apart from `--port`, following options can also be used with `surang start` command.

Options passed through command line will take precedence over respective global options.

| Argument   |     | Type    | Description                                                                       | Required (default) |
| ---------- | --- | ------- | --------------------------------------------------------------------------------- | ------------------ |
| --port     | -p  | number  | port on which local HTTP server<br/>is running                                    | Yes                |
| --host     | -h  | string  | upstream surang-server address<br/>(without protocol prefix)                      | Yes*               |
| --auth-key | -a  | string  | auth key to be used for<br/>authenticating to surang-server                       | Yes*               |
| --secure   | -s  | boolean | set this to "false" if your surang-server<br/>doesn't support https & wss traffic | No (true)*         |
| --verbose  | -v  | boolean | set this to "false" to disable<br/>logging of incoming requests                   | No (true)*         |
| --version  |     | boolean | show surang client version                                                        | No (false)         |
| --help     |     | boolean | show help on CLI usage                                                            | No (false)         |

\*Host, Auth key, Security protocol & Logging options can be set in global config
through `surang config` command.

> `--auth-key` is used by surang client to authenticate itself to surang-server.
> You can set this to any secret string on your surang-server as an environment variable.
> This prevents other people from using your server even if they know the server url.
> Check out instructions at [surang-server](https://github.com/RathiRohit/surang-server)
> for detailed info.

> Disabling `--secure` flag is not recommended. Exposing your localhost server to
> internet over non-secure protocols is never a good idea.

---

#### How is Surang different from [localtunnel](https://github.com/localtunnel/localtunnel)?

'localtunnel' is great. It's open-source, free, supports multiple clients at once, and
you can host your own localtunnel server too. Unfortunately, localtunnel uses
TCP connections over non-root TCP ports. This can be troublesome if you want to
host your own server, as most of the cloud platforms with free tiers don't give this much
freedom to us (and our servers). On the other hand WebSockets are now widely supported on
cloud hosting platforms.

(PS: I got inspired to write this library, when I realised that [localtunnel can not be
hosted on Heroku's free tier](https://github.com/localtunnel/server/issues/88).)

  - `localtunnel` uses TCP connections, `surang` uses WebSocket connection to do the trick.
  - `localtunnel` cannot be hosted on platforms which don't support it's
    [requirements](https://github.com/localtunnel/server#overview), `surang` should be
    easier to host as WebSockets are widely supported nowadays.
  - `localtunnel` allows multiple client connections with single server, `surang` doesn't (yet).
    Everyone is supposed to host their own surang-server.
  - `localtunnel` is mature and has great community, `surang` is in early phase and might not
    work for all types of requests yet.
