function ChessBoard()
{
    this.pieces = [];
    this.board = [];
    for (let x = 0; x < 8; x++)
        this.board.push([]);
    const backrow = [
        "Rook",
        "Knight",
        "Bishop",
        "Queen",
        "King",
        "Bishop",
        "Knight",
        "Rook"
    ];
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][0] = {
            piece: `White ${backrow[x]}`,
            position: { x: x, y: 0 },
            id: x
        });
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][1] = {
            piece: "White Pawn",
            position: { x, y: 1 },
            id: x + 8
        });
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][6] = {
            piece: "Black Pawn",
            position: {x, y: 6 },
            id: x + 16
        });
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][7] = {
            piece: `Black ${backrow[x]}`,
            position: { x: x, y: 7 },
            id: x + 24
        });
}