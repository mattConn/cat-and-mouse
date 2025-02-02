// @ is player
// # is cat
// > is exit
const allMapStrings = [
    `_|__|_____
    ___|______
    _____#__@_
    __________
    _|________
    _____|____
    __________
    |________|
    _____|__|_
    _|_|_>____`,

    `|___>__|__
    __|___#___
    __________
    _____|____
    ___|_____|
    |__|______
    __________
    __|@______
    |_________
    ______|___`
]

const randomStatusMessage = (statusType = 'info') => {
    const messageMap = {
        info: ['Good luck!', 'Will you survive?', 'Can you escape?'],
        error: ['Try again!', 'You lost!', 'You\'re lunch!'],
        success: ['Freedom!', 'You won!', 'You escaped!']
    }

    const messageIndex = Math.floor(Math.random() * messageMap[statusType].length);
    return messageMap[statusType][messageIndex];
}

const currentMap = [];

const generateMapInPlace = (map) => {
    // set blanks
    for (let row = 0; row < 10; row++) {
        map[row] = [];
        for (let col = 0; col < 10; col++) {
            map[row][col] = '_';
        }
    }

    const entities = ['@', '#', '>', '|'];
    const randomBoardIndex = () => Math.floor(Math.random() * 10);

    // randomly add walls
    const wall = '|';

    for (let i = 0; i < 10; i++) {
        let row = randomBoardIndex()
        let col = randomBoardIndex()
        while (entities.includes(map[row][col])) {
            row = randomBoardIndex()
            col = randomBoardIndex()
        }
        map[row][col] = wall;
        renderGrid(currentMap);
    }

    // randomly add entities
    entities.forEach((entity) => {
        let row = randomBoardIndex()
        let col = randomBoardIndex()
        while (entities.includes(map[row][col])) {
            row = randomBoardIndex()
            col = randomBoardIndex()
        }
        map[row][col] = entity;
        renderGrid(currentMap);
    });

    // generate map string
    let mapString = '';
    map.forEach((row) => {
        mapString += row.join('') + '\n';
    });
    console.log(mapString);
}

const updateUserPos = (oldRow, oldCol, newRow, newCol) => {
    currentMap[oldRow][oldCol] = '_';
    currentMap[newRow][newCol] = '@';
}

const updateCatPos = (oldRow, oldCol, userRow, userCol) => {
    let newRow = oldRow;
    let newCol = oldCol;

    if (userRow > oldRow) newRow++;
    if (userRow < oldRow) newRow--;
    if (userCol > oldCol) newCol++;
    if (userCol < oldCol) newCol--;

    const invalidCells = ['>', '|'];
    if (invalidCells.includes(currentMap[newRow][newCol])) {
        if (userRow > newRow) newRow--;
        if (userRow < newRow) newRow++;
        if (userCol > newCol) newCol--;
        if (userCol < newCol) newCol++;
    }

    currentMap[oldRow][oldCol] = '_';
    currentMap[newRow][newCol] = '#';
}

const showGameStatus = (statusType = 'info') => {
    const statusDiv = document.querySelector('.status');

    const statusTypes = ['info', 'error', 'success'];
    statusTypes.forEach((type) => statusDiv.classList.remove(type));
    statusDiv.classList.add(statusType);

    statusDiv.style.display = 'block';
    statusDiv.innerText = randomStatusMessage(statusType);

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 1500);
}

const renderGrid = (map) => {
    const grid = document.querySelector('.grid');
    grid.innerHTML = '';

    let oldUserRow = null;
    let oldUserCol = null;
    let oldCatRow = null;
    let oldCatCol = null;
    map.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell === '@') {
                oldUserRow = rowIndex;
                oldUserCol = cellIndex;
            }
            if (cell === '#') {
                oldCatRow = rowIndex;
                oldCatCol = cellIndex;
            }
        });
    });

    map.forEach((row, rowIndex) => {
        let rowHTML = '';
        row.forEach((cell, cellIndex) => {
            let classList = ["cell"];
            let innerHTML = '';

            const distance = Math.max(Math.abs(rowIndex - oldUserRow), Math.abs(cellIndex - oldUserCol));
            if (distance === 1) {
                classList.push("adjacent");
            }
            switch (cell) {
                case '_':
                    classList.push("empty");
                    break;
                case '@':
                    classList.push("player");
                    innerHTML = '🐁';
                    break;
                case '#':
                    classList.push("enemy");
                    if (distance === 1) classList.push("blocker");
                    innerHTML = '🐈';
                    break;
                case '>':
                    classList.push("exit");
                    innerHTML = '🚪';
                    break;
                case '|':
                    classList.push("wall");
                    if (distance === 1) classList.push("blocker");
                    innerHTML = '🐢';
                    break;
            }
            rowHTML += `<div class="${classList.join(' ')}">${innerHTML}</div>`;
        });
        grid.innerHTML += `<div class="row">${rowHTML}</div>`;
    });

    // attach click handler
    const rows = grid.querySelectorAll('.row');
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('.cell');
        cells.forEach((cell, cellIndex) => {
            if (!cell.classList.contains('adjacent')) return;

            cell.addEventListener('click', () => {
                const wrapper = document.querySelector('.wrapper');
                wrapper.classList.add('waiting');
                const newCell = currentMap[rowIndex][cellIndex];
                switch (newCell) {
                    case '_':
                        updateUserPos(oldUserRow, oldUserCol, rowIndex, cellIndex);
                        renderGrid(currentMap);
                        setTimeout(() => {
                            updateCatPos(oldCatRow, oldCatCol, rowIndex, cellIndex)
                            renderGrid(currentMap);
                            setTimeout(() => {
                                if (currentMap[rowIndex][cellIndex] === '#') {
                                    showGameStatus('error');
                                    generateMapInPlace(currentMap);
                                    renderGrid(currentMap);
                                } else {
                                    renderGrid(currentMap);
                                };
                            }, 500);
                        }, 300);
                        break;
                    case '#':
                        break;
                    case '>':
                        currentMap[oldUserRow][oldUserCol] = '_';
                        currentMap[rowIndex][cellIndex] = '@';
                        renderGrid(currentMap);
                        setTimeout(() => {
                            currentMap[rowIndex][cellIndex] = '>';
                            renderGrid(currentMap);
                            setTimeout(() => {
                                showGameStatus('success');
                                generateMapInPlace(currentMap);
                                renderGrid(currentMap);
                            }, 300);
                        }, 300);
                        break;
                    case '|':
                        break;
                }
                wrapper.classList.remove('waiting');
            });
        });
    });
}

// generate map
generateMapInPlace(currentMap);
// render
renderGrid(currentMap);
setTimeout(() => {
    showGameStatus('info');
}, 300);