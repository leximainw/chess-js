const boardGrid = document.querySelector("main .board");
const gameState = new ChessBoard();
init();

function drawBoard(board)
{
    for (let piece of board.pieces)
    {
        let pieceImg = document.querySelector(`#piece${piece.id}`);
        if (pieceImg === null)
        {
            pieceImg = document.createElement("img");
            pieceImg.id = `piece${piece.id}`;
            pieceImg.src = `images/${piece.piece.replace(" ", "-")}.svg`;
            pieceImg.classList.add("piece")
        }
        const index = piece.position.x + 56 - piece.position.y * 8;
        boardGrid.children[index].appendChild(pieceImg);
    }
}

function init()
{
    for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
        {
            const tile = document.createElement("div");
            tile.classList.add(x % 2 == y % 2 ? "lt" : "dt");
            boardGrid.appendChild(tile);
        }
    drawBoard(gameState);
}