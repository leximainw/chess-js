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
    const backtypes = [
        2,
        4,
        3,
        1,
        0,
        3,
        4,
        2
    ];
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][0] = {
            piece: `White ${backrow[x]}`,
            position: { x: x, y: 0 },
            pieceType: backtypes[x],
            player: 0,
            id: x
        });
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][1] = {
            piece: "White Pawn",
            position: { x, y: 1 },
            pieceType: 5,
            player: 0,
            id: x + 8
        });
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][6] = {
            piece: "Black Pawn",
            position: {x, y: 6 },
            pieceType: 5,
            player: 1,
            id: x + 16
        });
    for (let x = 0; x < 8; x++)
        this.pieces.push(this.board[x][7] = {
            piece: `Black ${backrow[x]}`,
            position: { x: x, y: 7 },
            pieceType: backtypes[x],
            player: 1,
            id: x + 24
        });
    for (const piece of this.pieces)
        piece.hasMoved = false;
    this.playerToMove = 0;
    this.numPlayers = 2;
}

ChessBoard.prototype.isLegalMove = function(move)
{
    let undo = null
    if (!(undo = this.tryMakeMove(move)))
        return false;
    this.unmakeMove(undo);
    return true;
}

ChessBoard.prototype.isValidTile = function(x, y)
{
    return Number.isInteger(x) && Number.isInteger(y)
        && x >= 0 && x < 8 && y >= 0 && y < 8;
}

ChessBoard.prototype.makeMove = function(move)
{
    if (!this.isValidTile(move.startX, move.startY)
        || !this.isValidTile(move.endX, move.endY)
        || move.startX == move.endX && move.startY == move.endY)
        return null;
    const piece = this.board[move.startX][move.startY];
    if (!piece || piece.player != this.playerToMove)
        return null;
    const dx = move.endX - move.startX;
    const dy = move.endY - move.startY;
    const absdx = Math.abs(dx);
    const absdy = Math.abs(dy);
    const undo = { move };
    if (piece.pieceType == 0 && absdx == 2 && dy == 0)
    {
        if (piece.hasMoved || this.testForCheck(this.playerToMove))
            return null;
        let targetRook;
        let tileX = piece.position.x;
        const tileY = piece.position.y;
        const castleDir = Math.sign(dx);
        for (let rayLen = 1; rayLen < 7; rayLen++)
        {
            tileX += castleDir;
            if (!this.isValidTile(tileX, tileY))
                return null;
            targetRook = this.board[tileX][tileY];
            if (!targetRook)
                continue;
            else if (targetRook.pieceType != 2 || targetRook.hasMoved
                || targetRook.player != piece.player)
                return null;
            else
                break;
        }
        if (!targetRook)
            return null;
        const rookPos = {
            x: piece.position.x + castleDir,
            y: tileY
        };
        piece.position = rookPos;
        this.board[rookPos.x][tileY] = piece;
        this.board[move.startX][tileY] = undefined;
        if (this.testForCheck(this.playerToMove))
        {
            piece.position = { x: move.startX, y: tileY };
            this.board[move.startX][tileY] = piece;
            this.board[rookPos.x][tileY] = undefined;
            return null;
        }
        undo.castleRook = targetRook;
        undo.castleSrc = targetRook.position;
        this.board[targetRook.position.x][targetRook.position.y] = undefined;
        this.board[rookPos.x][rookPos.y] = targetRook;
        targetRook.position = rookPos;
        targetRook.hasMoved = true;
    }
    else if (piece.pieceType == 4)
    {
        if (Math.max(absdx, absdy) != 2
            || Math.min(absdx, absdy) != 1)
            return null;
        const target = this.board[move.endX][move.endY];
        if (target && target.player == piece.player)
            return null;
    }
    else if (piece.pieceType == 5)
    {
        if (absdx + absdy > 2)
            return null;
        const forward = Math.sign(dy) == -Math.sign(piece.player - 0.5);
        if (!forward)
            return null;
        if ((absdx != 0) == !this.board[move.endX][move.endY]
            || (this.board[move.startX][(move.startY + move.endY) / 2]
            || piece.hasMoved) && absdy == 2)
            return null;
    }
    else
    {
        if (!(dx == 0 || dy == 0 || absdx == absdy))
            return null;
        const diagonal = dx != 0 && dy != 0;
        const dist = Math.max(absdx, absdy);
        let tileX = piece.position.x;
        let tileY = piece.position.y;
        const rayX = Math.sign(dx);
        const rayY = Math.sign(dy);
        let blocked = false;
        for (let i = 1; i <= dist; i++)
        {
            tileX += rayX;
            tileY += rayY;
            if (!this.board[tileX][tileY])
                continue;
            else if (i != dist || this.board[tileX][tileY].player == piece.player)
            {
                blocked = true;
                break;
            }
        }
        if (blocked)
            return null;
        else if (piece.pieceType == 0 && dist != 1)
            return null;
        else if (piece.pieceType == 2 && diagonal)
            return null;
        else if (piece.pieceType == 3 && !diagonal)
            return null;
    }
    undo.captured = this.board[move.endX][move.endY];
    const captureIndex = this.pieces.indexOf(undo.captured);
    if (captureIndex != -1)
        this.pieces.splice(captureIndex, 1);
    this.board[move.endX][move.endY] = piece;
    this.board[move.startX][move.startY] = undefined;
    piece.position = { x: move.endX, y: move.endY };
    undo.hadMoved = piece.hasMoved;
    piece.hasMoved = true;
    this.playerToMove = (this.playerToMove + 1) % this.numPlayers;
    return undo;
}

ChessBoard.prototype.testForCheck = function(player)
{
    let inCheck = false;
    const rayMap = [0, 1, 1, 1, 0, -1, -1, -1];
    const knightMap = [1, 2, 2, 1, -1, -2, -2, -1];
    const pawnMap = [-1, 1, -1, 1, -1, 0, -1, 0];
    for (const piece of this.pieces)
    {
        if (piece.pieceType != 0 || piece.player != player)
            continue;
        for (let rayDir = 0; rayDir < 8 && !inCheck; rayDir++)
        {
            let tileX = piece.position.x;
            let tileY = piece.position.y;
            const orthoRayDir = (rayDir + 2) % 8;
            const knightX = tileX + knightMap[rayDir];
            const knightY = tileY + knightMap[orthoRayDir];
            if (this.isValidTile(knightX, knightY))
            {
                const knight = this.board[knightX][knightY];
                if (knight && knight.pieceType == 4
                    && knight.player != player)
                    return true;
            }
            const rayX = rayMap[rayDir];
            const rayY = rayMap[orthoRayDir];
            const attackingSlider = rayDir % 2 ? 3 : 2;
            for (let rayLen = 1; rayLen < 8; rayLen++)
            {
                tileX += rayX;
                tileY += rayY;
                if (!this.isValidTile(tileX, tileY))
                    break;
                const target = this.board[tileX][tileY];
                if (!target)
                    continue;
                else if (target.player == player)
                    break;
                else if (rayLen == 1 && target.pieceType == 0
                    || target.pieceType == attackingSlider
                    || target.pieceType == 5 && rayLen == 1
                    && pawnMap[rayDir] == player
                    || target.pieceType == 1)
                {
                    inCheck = true;
                    break;
                }
                else
                    break;
            }
        }
    }
    return inCheck;
}

ChessBoard.prototype.tryMakeMove = function(move)
{
    const currPlayer = this.playerToMove;
    const undo = this.makeMove(move);
    if (undo == null)
        return null;
    if (this.testForCheck(currPlayer))
    {
        this.unmakeMove(undo);
        return null;
    }
    return undo;
}

ChessBoard.prototype.unmakeMove = function(undo)
{
    const piece = this.board[undo.move.startX][undo.move.startY]
        = this.board[undo.move.endX][undo.move.endY];
    this.board[undo.move.endX][undo.move.endY] = undefined;
    piece.position = { x: undo.move.startX, y: undo.move.startY };
    piece.hasMoved = undo.hadMoved;
    const captured = undo.captured;
    if (captured)
    {
        this.pieces.push(captured);
        this.board[captured.position.x][captured.position.y] = captured;
    }
    const rook = undo.castleRook;
    if (rook)
    {
        this.board[rook.position.x][rook.position.y] = undefined;
        rook.position = undo.castleSrc;
        this.board[rook.position.x][rook.position.y] = rook;
        rook.hasMoved = false;
    }
    this.playerToMove = (this.playerToMove + this.numPlayers - 1) % this.numPlayers;
}