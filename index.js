const boardGrid = document.querySelector("main .board");
const gameState = new ChessBoard();
init();

const gameSounds = [
    new Audio("sounds/move-self.mp3"),
    new Audio("sounds/capture.mp3"),
    new Audio("sounds/castle.mp3"),
    new Audio("sounds/move-check.mp3")
];

// source: https://stackoverflow.com/questions/36532307/rem-px-in-javascript
function convertRemToPx(rem)
{
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function drawBoard(board)
{
    for (const piece of board.pieces)
    {
        let pieceImg = document.querySelector(`#piece${piece.id}`);
        if (pieceImg == null)
        {
            pieceImg = document.createElement("img");
            pieceImg.id = `piece${piece.id}`;
            pieceImg.src = `images/${piece.piece.replace(" ", "-")}.svg`;
            pieceImg.classList.add("piece");

            pieceImg.draggable = false;
            const dragState = {};
            pieceImg.addEventListener("mousedown", e =>
            {
                if (piece.player != gameState.playerToMove)
                    return;
                dragState.startX = e.x;
                dragState.startY = e.y;
                dragState.dragging = false;
                const moveHandler = e =>
                {
                    const dx = e.x - dragState.startX;
                    const dy = e.y - dragState.startY;
                    const dist2 = dx * dx + dy * dy;
                    if (Math.sqrt(dist2) > convertRemToPx(0.25))
                    {
                        if (!dragState.dragging)
                        {
                            dragState.dragging = true;
                            const rect = pieceImg.getBoundingClientRect();
                            dragState.left = rect.left + window.scrollX;
                            dragState.top = rect.top + window.scrollY;
                            dragState.parent = pieceImg.parentElement;
                            pieceImg.style.width = `${pieceImg.clientWidth}px`;
                            pieceImg.style.height = `${pieceImg.clientHeight}px`;
                            pieceImg.classList.add("dragging");
                            document.body.prepend(pieceImg);
                            drawMoves(piece.position.x, piece.position.y);
                        }
                        pieceImg.style.left = `${dragState.left + dx}px`;
                        pieceImg.style.top = `${dragState.top + dy}px`;
                    }
                };
                document.addEventListener("mousemove", moveHandler);
                document.addEventListener("mouseup", e =>
                {
                    dragState.endX = e.x;
                    dragState.endY = e.y;
                    if (dragState.dragging)
                    {
                        clearMoves();
                        const imgRect = pieceImg.getBoundingClientRect();
                        const imgX = (imgRect.left + imgRect.right) / 2;
                        const imgY = (imgRect.top + imgRect.bottom) / 2;
                        let newTile = undefined;
                        for (const tile of boardGrid.children)
                        {
                            const rect = tile.getBoundingClientRect();
                            if (imgX >= rect.left && imgY >= rect.top
                                && imgX < rect.right && imgY < rect.bottom)
                            {
                                newTile = tile;
                                break;
                            }
                        }
                        let undo;
                        const endIndex = Array.from(boardGrid.children).indexOf(newTile);
                        if (endIndex != -1)
                        {
                            const move = {
                                startX: piece.position.x,
                                startY: piece.position.y,
                                endX: endIndex % 8,
                                endY: 7 - (endIndex & 56) / 8
                            };
                            if (!(undo = gameState.tryMakeMove(move)))
                                newTile = undefined;
                        }
                        if (newTile === undefined)
                            newTile = dragState.parent;
                        while (newTile.firstChild)
                            newTile.removeChild(newTile.firstChild);
                        pieceImg.classList.remove("dragging");
                        pieceImg.style = null;
                        newTile.appendChild(pieceImg);
                        if (undo)
                        {
                            if (undo.castleRook)
                                drawBoard(gameState);
                            if (undo.captured)
                            {
                                const capturedImg = document.querySelector(`#piece${undo.captured.id}`);
                                if (capturedImg && capturedImg.parentElement != null)
                                    capturedImg.parentElement.removeChild(capturedImg);
                            }
                            if (undo.wasPromoted)
                                pieceImg.src = pieceImg.src.replace('Pawn',
                                [0, 'Queen', 'Rook', 'Bishop', 'Knight'][piece.pieceType]);
                            if (gameState.testForCheck(gameState.playerToMove))
                                gameSounds[3].play();
                            else if (undo.castleRook)
                                gameSounds[2].play();
                            else if (undo.captured)
                                gameSounds[1].play();
                            else
                                gameSounds[0].play();
                        }
                    }
                    document.removeEventListener("mousemove", moveHandler);
                },
                { once: true });
            });
        }
        const index = piece.position.x + 56 - piece.position.y * 8;
        boardGrid.children[index].appendChild(pieceImg);
    }
}

function clearMoves()
{
    for (const elem of document.querySelectorAll(".move-target"))
        elem.parentElement.removeChild(elem);
    for (const elem of document.querySelectorAll(".capture-target"))
        elem.classList.remove("capture-target");
}

function drawMoves(startX, startY)
{
    for (let endY = 0; endY < 8; endY++)
    {
        for (let endX = 0; endX < 8; endX++)
        {
            let moveInfo = gameState.isLegalMove(
                { startX, startY, endX, endY });
            if (moveInfo)
            {
                const index = endX + 56 - endY * 8;
                const elem = boardGrid.children[index];
                if (!elem.children.length)
                {
                    const overlay = document.createElement("div");
                    overlay.classList.add("move-target");
                    if (moveInfo.isEnPassant)
                        overlay.classList.add("ep");
                    elem.appendChild(overlay);
                }
                else
                    elem.children[0].classList.add("capture-target");
            }
        }
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