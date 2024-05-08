import Axios from 'axios'
import jsonwebtoken, {decode} from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-7rdrmya5vfk45uf3.us.auth0.com/.well-known/jwks.json'


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

/* async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys
  const signingKeys = keys.find(key => key.kid === jwt.header.kid)
  logger.info('signingKeys', signingKeys)

  if (!signingKeys) {
      throw new Error('The JWKS endpoints did not contain any keys')
  }

  // get pem  data
  const pemData = signingKeys.x5c[0]

  // convert pem data to cert
  const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`

  return jsonwebtoken.verify(token, cert, { algorithms: ['RS256'] })
} */

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  //const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  const certificate = await getCertificate(token)
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCertificate(token){
  const client = jwksClient({
    jwksUri: jwksUrl
  });

  const tokenHeader = decode(token, {complete: true}).header;
  const key = await client.getSigningKey(tokenHeader.kid);

  return key.getPublicKey();
}
