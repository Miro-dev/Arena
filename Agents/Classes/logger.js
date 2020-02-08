module.exports = class Logger {
  constructor() {
    console.log("Logger Created!");

    this.logArray = [" "];
  }

  getLog() {
    return this.logArray;
  }

  push(value) {
    console.log(value);
    this.logArray.push(value);
  }

  clearLog() {
    this.logArray = [" "];
  }
};

// module.exports = Logger;
