const {LinValidator, Rule} = require('../core/lin-validator-v2')

class PositiveIntergerValidator extends LinValidator{
    constructor() {
        super()
        this.id = [
            new Rule('isInt', '需要是正整数', {min: 1})
        ]
        this.name = [
        new Rule('isLength', '昵称不符合长度规范', { min: 4, max: 32 })
        ]
    }
}


module.exports = {
    PositiveIntergerValidator
}