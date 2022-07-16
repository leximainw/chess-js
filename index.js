function init()
{
    const board = document.querySelector("main .grid");
    for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
        {
            const tile = document.createElement("div");
            tile.classList.add(x % 2 == y % 2 ? "lt" : "dt");
            board.appendChild(tile);
        }
}

init();