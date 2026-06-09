"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRequired = exports.PLAN_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PLAN_KEY = 'plan';
const PlanRequired = (plan) => (0, common_1.SetMetadata)(exports.PLAN_KEY, plan);
exports.PlanRequired = PlanRequired;
//# sourceMappingURL=plan-required.decorator.js.map