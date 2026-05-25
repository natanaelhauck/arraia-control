export const DEFAULT_PIECE_TYPE = 'Vestido'

export const pieceTypeOptions = ['Vestido', 'Saia', 'Conjunto', 'Blusa Xadrez']

export function normalizePieceType(value) {
  return pieceTypeOptions.includes(value) ? value : DEFAULT_PIECE_TYPE
}
