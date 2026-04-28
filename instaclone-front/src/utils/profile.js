export const PROFILE_NAME_MAX_LENGTH = 255
export const PROFILE_USERNAME_MAX_LENGTH = 30
export const PROFILE_BIO_MAX_LENGTH = 500
export const PROFILE_AVATAR_MAX_MB = 2
export const POST_CAPTION_MAX_LENGTH = 2200
export const POST_IMAGE_MAX_MB = 5

export function defaultAuthor(overrides = {}) {
  return {
    id: null,
    name: 'Usuario',
    username: 'usuario',
    avatar_url: 'https://placehold.co/80x80/f4ddcf/2d241a?text=%40',
    ...overrides,
  }
}
