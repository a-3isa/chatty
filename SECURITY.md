# Security policy

## Supported versions

Only the `master` branch is maintained. Fixes are not backported.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub:
**Security → Report a vulnerability** on this repository
([direct link](https://github.com/a-3isa/chatty/security/advisories/new)).

Please do not open a public issue for a security problem.

Include what you can of:
- the HTTP route, socket event or file affected;
- steps to reproduce, or a proof of concept;
- the impact you expect.

I aim to acknowledge reports within a week. Once an issue is confirmed, a fix is
prepared on a private branch and you are credited in the advisory unless you prefer not to be.

## What the code does today

- Passwords are hashed with bcrypt. Five wrong passwords lock an account for 15 minutes.
- Tokens carry a type: 15-minute access tokens, 7-day refresh tokens and 15-minute
  password-reset tokens. Each is accepted only where its type is expected.
- HTTP routes need an access token, except register and login. A socket needs an access
  token to connect; messages are sent as the socket's own user, and a socket can join
  only its own room.
- API responses and socket messages expose only a user's id and username.
- Request bodies are validated with whitelisting, and the HTTP API has a rate limit of
  10 requests a minute per client.

Not active yet, although the code is in the repository: Helmet headers, the request
sanitisation middleware and the CSRF guard. The bundled HTML client keeps tokens in
`localStorage`, and the Socket.IO server accepts any origin.

## Scope

In scope: the code in this repository.

Out of scope: findings that need a stolen token or leaked environment secrets, and
denial of service by volume.
