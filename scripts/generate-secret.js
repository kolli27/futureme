// Generate a secure secret for NextAuth
const crypto = require('crypto')

const secret = crypto.randomBytes(32).toString('hex')
console.log('Generated NEXTAUTH_SECRET:')
console.log(secret)
console.log('\nAdd this to your Vercel environment variables:')