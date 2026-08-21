export interface SoDRule {
  id: string;
  code: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  conflictingEntitlements: Array<{ app: string; permission: string }>;
  riskExplanation: string;
  enforcementAction: 'HARD_BLOCK' | 'REQUIRE_APPROVAL_OVERRIDE';
}

export class SoDService {
  private rules: SoDRule[] = [
    {
      id: 'sod-rule-1',
      code: 'SOD-PAY-01',
      name: 'Payment Creator vs Payment Releaser',
      description: 'An identity cannot possess both payment batch creation and payment release authority simultaneously.',
      severity: 'CRITICAL',
      conflictingEntitlements: [
        { app: 'Banking Gateway', permission: 'Create Batch' },
        { app: 'Banking Gateway', permission: 'Release Funds' },
      ],
      riskExplanation: 'Prevents fraudulent or unverified fund transfers by enforcing dual-custody authorization.',
      enforcementAction: 'HARD_BLOCK',
    },
    {
      id: 'sod-rule-2',
      code: 'SOD-SEC-02',
      name: 'Production Deployer vs Production Auditor',
      description: 'Engineers with direct production deployment privileges cannot independently sign off on SOC-2 audit logs.',
      severity: 'HIGH',
      conflictingEntitlements: [
        { app: 'AWS', permission: 'Production Admin' },
        { app: 'Datadog', permission: 'Audit Log Manager' },
      ],
      riskExplanation: 'Eliminates self-audit bias and satisfies regulatory compliance standards.',
      enforcementAction: 'REQUIRE_APPROVAL_OVERRIDE',
    },
  ];

  public getAllRules(): SoDRule[] {
    return this.rules;
  }

  public checkConflicts(requestedEntitlements: string[]): {
    hasConflict: boolean;
    conflicts: Array<{
      rule: SoDRule;
      matchedItems: string[];
      action: 'HARD_BLOCK' | 'REQUIRE_APPROVAL_OVERRIDE';
    }>;
  } {
    const conflicts: any[] = [];

    for (const rule of this.rules) {
      const matched = rule.conflictingEntitlements.filter((ce) =>
        requestedEntitlements.some((req) => req.toLowerCase().includes(ce.app.toLowerCase()))
      );

      if (matched.length >= 2) {
        conflicts.push({
          rule,
          matchedItems: matched.map((m) => `${m.app}: ${m.permission}`),
          action: rule.enforcementAction,
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }
}

export const sodService = new SoDService();
