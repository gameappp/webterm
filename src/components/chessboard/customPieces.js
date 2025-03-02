export const customPieces = () => {
  const pieceImages = {
    wP: "/pieces/white-pawn.svg",
    wR: "/pieces/white-rook.svg",
    wN: "/pieces/white-knight.svg",
    wB: "/pieces/white-bishop.svg",
    wQ: "/pieces/white-queen.svg",
    wK: "/pieces/white-king.svg",
    bP: "/pieces/black-pawn.svg",
    bR: "/pieces/black-rook.svg",
    bN: "/pieces/black-knight.svg",
    bB: "/pieces/black-bishop.svg",
    bQ: "/pieces/black-queen.svg",
    bK: "/pieces/black-king.svg",
  };

  const pieces = {};
  Object.keys(pieceImages).forEach((piece) => {
    pieces[piece] = ({ squareWidth }) => (
      <img
        src={pieceImages[piece]}
        alt={piece}
        style={{
          width: squareWidth,
          height: squareWidth,
          padding: "5px",
          objectFit: "contain",
        }}
      />
    );
  });

  return pieces;
};
