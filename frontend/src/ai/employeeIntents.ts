import type { AIIntentResult } from './intentDefinitions';

export const EMPLOYEE_INTENTS: Record<string, AIIntentResult> = {
  // Employee 1: What should I do next?
  EMP_WHAT_TO_DO_NEXT: {
    intent: 'EMP_WHAT_TO_DO_NEXT',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `Based on your current onboarding status, your next priority is to complete the **Development Environment Checklist**.

You have completed **8 of 10 assigned onboarding tasks**, and your overall onboarding readiness is currently **80%**. Your profile and company orientation are complete, and Slack/GitHub access has already been activated.

The remaining blocker is **Jira access**, which is still awaiting IT provisioning. While waiting for that access, you can complete the **Security & Compliance resource** and the development environment checklist.

### 📋 Recommended Next Order
1. Complete Development Environment Checklist
2. Finish Security & Compliance resource
3. Follow up on Jira access

Once these are completed, your onboarding should be ready for final manager review.`,
    evidence: {
      stats: {
        readinessScore: 80,
        completedTasks: 8,
        totalTasks: 10,
        blockerCount: 1,
      },
      whyThisDecision: {
        roleReq: 'Junior Backend Developer',
        projReq: 'Payments Engine v2',
        policy: 'Critical Path Priority: Dev Setup before Sprint Assignment',
        checks: [
          { label: 'Development Environment Checklist', passed: false, detail: 'Priority #1' },
          { label: 'Security & Compliance Resource', passed: false, detail: 'Priority #2' },
          { label: 'Jira Access Follow-up', passed: false, detail: 'Priority #3 (IT Dependency)' },
        ],
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/me/tasks',
      deepLinkLabel: 'Open Development Setup Checklist',
      tags: ['Contextual Priority', 'Development Setup', '80% Readiness'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Continue Development Setup →', actionKey: 'CONTINUE_DEV_SETUP', deepLink: '/me/tasks', primary: true },
      { label: 'View Tasks', actionKey: 'VIEW_TASKS', deepLink: '/me/tasks' },
    ],
  },

  // Employee 2: Show my onboarding progress.
  EMP_SHOW_ONBOARDING_PROGRESS: {
    intent: 'EMP_SHOW_ONBOARDING_PROGRESS',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `### 📊 Your Onboarding Overview

**Overall Readiness: 80% 🟢**

You have completed **8 of 10 onboarding tasks**, with **4 of 5 assigned resources** completed. Your employee profile has been approved and your primary communication and development tools are already active.

### ✅ Completed
* ✅ Employee profile & documentation
* ✅ Company orientation
* ✅ Security training
* ✅ Team introduction
* ✅ Slack & GitHub setup

### ⏳ Still Pending
* ⏳ Development Environment Checklist
* ⏳ Jira access

**AI Insight:** Your onboarding is progressing normally. The only external dependency is Jira provisioning; the remaining checklist can be completed without waiting for IT.

**Estimated remaining onboarding effort:** ~30–45 minutes.`,
    evidence: {
      stats: {
        readinessScore: 80,
        completedTasks: 8,
        totalTasks: 10,
        blockerCount: 1,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/me',
      deepLinkLabel: 'Open Employee Command Center',
      tags: ['Onboarding Overview', '80% Readiness', '30-45 min remaining'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Open Command Center', actionKey: 'OPEN_COMMAND_CENTER', deepLink: '/me', primary: true },
      { label: 'View Tasks', actionKey: 'VIEW_TASKS', deepLink: '/me/tasks' },
    ],
  },

  // Employee 3: I need help with my current task.
  EMP_HELP_CURRENT_TASK: {
    intent: 'EMP_HELP_CURRENT_TASK',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `Your current priority is the **Development Environment Checklist**, which is required before you begin your first development assignment.

I found that your basic development setup is already completed, including **GitHub access and repository access**. The remaining steps are environment verification and configuration.

### 🔍 Items to Verify
* Git installation and authentication
* Required runtime / dependencies
* Repository cloning
* Environment configuration
* Successful test / build execution

I can guide you through these steps one at a time and help identify any configuration issue before you submit the checklist.

**Recommended:** Start with **Git & repository verification**.`,
    evidence: {
      stats: {
        readinessScore: 80,
        completedTasks: 8,
        totalTasks: 10,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/me/tasks',
      deepLinkLabel: 'Open Guided Task Setup',
      tags: ['Interactive Setup', 'Dev Checklist', 'Step-by-Step'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Start Guided Setup →', actionKey: 'START_GUIDED_SETUP', deepLink: '/me/tasks', primary: true },
    ],
  },

  // Employee 4: My laptop is not working.
  EMP_LAPTOP_NOT_WORKING: {
    intent: 'EMP_LAPTOP_NOT_WORKING',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `I can help you troubleshoot this before escalating it to IT.

Your assigned device is currently registered in OnboardOS, but there is **no active hardware incident associated with it**.

### 🔧 Quick Troubleshooting Steps
1. Check the charger connection and power indicator LED.
2. Hold the power button down for approximately **10 seconds** to perform a hard reset, then try turning it back on.
3. Verify that the power outlet and adapter are functioning.

If the laptop still doesn't respond, you can create an **IT Helpdesk request** with your employee profile and device serial number.

* **Current IT Status:** 🟢 No existing ticket
* **Recommended Priority:** 🟠 Medium`,
    evidence: {
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/me/help',
      deepLinkLabel: 'Open IT Support Portal',
      tags: ['Hardware Incident Triage', 'Device Diagnostics', 'IT Helpdesk'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Run Quick Troubleshooting →', actionKey: 'RUN_TROUBLESHOOTING', primary: true },
      { label: 'Create IT Ticket →', actionKey: 'CREATE_TICKET', deepLink: '/me/help' },
    ],
  },

  // Employee 5: I need GitHub access.
  EMP_NEED_GITHUB_ACCESS: {
    intent: 'EMP_NEED_GITHUB_ACCESS',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `Your GitHub access request has already been provisioned!

* **Current Status:** 🟢 Ready to Claim
* **Access Type:** Development / Repository Contributor
* **Requested For:** Engineering Team (Payments Core)

You don't need to submit another request. Your access can be claimed directly from your **Onboarding Tool Suite**.

**Note:** Your **Jira access is still pending IT approval**, so full sprint tracking will be enabled once IT finishes provisioning.

**Recommended:** Claim GitHub access now and continue with your local dev setup.`,
    evidence: {
      stats: {
        readinessScore: 80,
        completedTasks: 8,
        totalTasks: 10,
        blockerCount: 1,
      },
      whyThisDecision: {
        roleReq: 'Junior Backend Developer',
        projReq: 'Payments Engine v2',
        policy: 'Birthright Tooling Provisioning Policy',
        checks: [
          { label: 'GitHub Access', passed: true, detail: 'Provisioned on Day 1' },
          { label: 'Slack Access', passed: true, detail: 'Provisioned on Day 1' },
          { label: 'Jira Access', passed: false, detail: 'Pending IT approval' },
        ],
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/me/marketplace',
      deepLinkLabel: 'Open Access Marketplace & Tools',
      tags: ['GitHub Provisioned', 'Ready to Claim', 'Jira Pending'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Claim GitHub Access →', actionKey: 'CLAIM_GITHUB', deepLink: '/me/marketplace', primary: true },
      { label: 'View All Tool Access', actionKey: 'VIEW_TOOLS', deepLink: '/me/marketplace' },
    ],
  },

  // Employee 6: Show my assigned resources.
  EMP_SHOW_ASSIGNED_RESOURCES: {
    intent: 'EMP_SHOW_ASSIGNED_RESOURCES',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `### 📚 Your Learning & Onboarding Resources

You currently have **5 resources assigned** based on your role and onboarding stage.

**Completed**
* ✅ Engineering Handbook
* ✅ Company Security & Compliance
* ✅ Developer Onboarding Guide

**In Progress**
* 🟡 Backend Development Standards

**Recommended**
* ⭐ Git Workflow & Branching Guide

Your resource completion is currently **60%**.

**AI Recommendation:** Finish the **Backend Development Standards** before your first sprint task.`,
    evidence: {
      stats: {
        readinessScore: 80,
        completedTasks: 3,
        totalTasks: 5,
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/knowledge',
      deepLinkLabel: 'Open Knowledge & Learning Base',
      tags: ['Curated Resources', '60% Completed', 'Git Workflow Recommended'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Open Recommended Resource →', actionKey: 'OPEN_RESOURCE', deepLink: '/knowledge', primary: true },
    ],
  },

  // Employee 7 (Flagship Blocker): What is blocking my onboarding?
  EMP_WHAT_IS_BLOCKING_ONBOARDING: {
    intent: 'EMP_WHAT_IS_BLOCKING_ONBOARDING',
    ownerRole: 'EMPLOYEE',
    badge: '✓ OnboardOS Intelligence',
    content: `I reviewed your current tasks, resources, access requests, and approval status.

Your onboarding is **80% complete**, and there is currently **one external blocker**:

### 🔴 Jira Access — Pending IT Provisioning

Your profile, manager approval, Slack access, GitHub access, and mandatory documentation are already complete.

**What you can do now:**
You don't need to wait for Jira. You can complete the **Development Environment Checklist** and your remaining learning resource in parallel.

* **Blocker Owner:** IT
* **Employee Action Required:** Complete remaining checklist
* **Impact:** Medium

**AI Recommendation:** Continue the available onboarding activities while IT completes Jira provisioning. Once Jira is activated, your onboarding should be ready for final completion.`,
    evidence: {
      stats: {
        readinessScore: 80,
        completedTasks: 8,
        totalTasks: 10,
        blockerCount: 1,
      },
      whyThisDecision: {
        roleReq: 'Junior Backend Developer',
        projReq: 'Payments Engine v2',
        policy: 'Blocker Classification: External IT Dependency (Jira API)',
        checks: [
          { label: 'Jira Access Provisioning', passed: false, detail: 'Awaiting IT Administrator approval' },
          { label: 'Development Checklist Submission', passed: false, detail: 'Actionable by Employee right now' },
          { label: 'GitHub & Slack Access', passed: true, detail: 'Fully provisioned' },
        ],
      },
      sourceType: 'DETERMINISTIC_KB',
      deepLink: '/me/tasks',
      deepLinkLabel: 'Inspect Blocker Graph in My Tasks',
      tags: ['Multi-System DAG Reasoning', 'Jira Blocker', '80% Readiness', 'Action Recommendation'],
      isDeterministic: true,
    },
    actions: [
      { label: 'Continue Onboarding →', actionKey: 'CONTINUE_ONBOARDING', deepLink: '/me/tasks', primary: true },
      { label: 'View Jira Request →', actionKey: 'VIEW_JIRA', deepLink: '/me/marketplace' },
    ],
  },
};
