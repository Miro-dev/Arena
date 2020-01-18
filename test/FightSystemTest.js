const assert = require("chai").assert;
const system = require("../FightSystem");

describe('FightSystem', function() {
    it("System should return 0", function() {
        assert.equal(system()[0], 0);
    })
});

describe('FightSystem', function() {
    it("System should return 100", function() {
        assert.equal(system()[1], 100);
    })
});

describe('FightSystem', function() {
    it("System should return 83", function() {
        assert.equal(system()[2], 83);
    })

});