import Cookies from 'js-cookie'

const TOKEN_KEY = 'auth_token'

export const tokenService = {
  set(token: string) {
    Cookies.set(TOKEN_KEY, token, {
      expires: 1,
      sameSite: 'lax',
    })
  },

  get() {
    return Cookies.get(TOKEN_KEY)
  },

  remove() {
    Cookies.remove(TOKEN_KEY)
  },
}
