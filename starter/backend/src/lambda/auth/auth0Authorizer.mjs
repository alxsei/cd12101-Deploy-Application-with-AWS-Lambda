import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJXrN+V4i9OH1iMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi03cmRybXlhNXZmazQ1dWYzLnVzLmF1dGgwLmNvbTAeFw0yNDA1MDUx
MTE4NTJaFw0zODAxMTIxMTE4NTJaMCwxKjAoBgNVBAMTIWRldi03cmRybXlhNXZm
azQ1dWYzLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMnCuY+kJsKdpLFI/t3JPwT1I8t6QsByCtnEHxlZyItV1rhxaoUyt0Hgkv5h
MBYbbnVrt7MC6RQcSIKso9vegpbiaiuMO1ZS8OJGqnhWRj2hayytpyhjlrZX044+
z83bgfXRsL+CYdoLvkL/e7cLcEThsRdYlrYppGI/K0D7tEwe1hRr27Kc8YBr+MM6
IGe1AvWDbbi0VzNhxcKbakHkMsZJPB4HZOx7tJPj4NnfvNcGjWi91RKhTtuf69xj
eRlElPgZ0AiVxEMlJNBM7ebDK2pvWYkFzOB6NdZtGEW6GT2rru8YWUXcAJp7Y1dn
bKQ8PXuO9inWj/0HTYLK62rCBb0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUh1PtWih8IlGjDpFP3H+Y1FCx618wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBvtuJ+2p0UGppdJsMPY4/LObNkZzHpIzHN/hcAUR7W
2SnhR7stl4TJWOJHdeNqBnHcCcPjq1+wj5nwS6RTC0H7pFTWDxGf3RHk0S+Ry5X8
7YfuYNb+4E5HZOcw5+TaZYx94y3Cordp+EuJEaqCGjvul4VjFMaHL3kQuE6OmuPk
6kGSKl7K2CYZMBtCYYwRW77qk3RjsK2xGz87fMTHWTkV3ySwMhD062UZFInn4mwu
sbY/5RdcozeyySuobequsT3tt5zfStoxS7lAIWKErLkV9RSRdQ0OzWLZWII4/f4G
Mpw4ke9CXjdarRgc9T+L7y4RIz7iYSaUd44vJWGdyjXc
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
