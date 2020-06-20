const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, 'logs', '/');
const FILE = path.join(PATH, 'logs.txt');

const READ = () => {
    if (fs.existsSync(FILE)) {
        return JSON.parse(fs.readFileSync (FILE, 'utf-8'));
    } else {
        if (!fs.existsSync(PATH))
            fs.mkdirSync(PATH);
        fs.writeFileSync(FILE, '[]');
        return []
    }
}

module.exports = {
    read_logs () {
        return READ();
    },
    write_logs (data) {
        let logs = READ();
        if (!data) return fs.writeFileSync(FILE, '[]');
        logs.push(data);
        fs.writeFileSync(FILE, JSON.stringify(logs, null, ' '));
    }
}
