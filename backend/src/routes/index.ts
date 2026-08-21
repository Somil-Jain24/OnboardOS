import { Router } from 'express';
import authRoutes from './authRoutes';
import employeeRoutes from './employeeRoutes';
import policyRoutes from './policyRoutes';
import planRoutes from './planRoutes';
import taskRoutes from './taskRoutes';
import integrationRoutes from './integrationRoutes';
import governanceRoutes from './governanceRoutes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to OnboardOS Enterprise Backend API',
    version: '1.0.0',
    documentation: {
      health: 'GET /health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        switchRole: 'POST /api/auth/switch-role',
      },
      employees: {
        list: 'GET /api/employees',
        detail: 'GET /api/employees/:id',
        create: 'POST /api/employees',
      },
      policies: {
        rules: 'GET /api/policies/rules',
        evaluateBirthright: 'POST /api/policies/evaluate-birthright',
        checkSoD: 'POST /api/policies/check-sod',
      },
      plans: {
        generate: 'POST /api/plans/generate',
        getPlan: 'GET /api/plans/:id',
        activeForEmployee: 'GET /api/plans/employee/:employeeId',
        whyExplanation: 'GET /api/plans/why/:taskId',
      },
      tasks: {
        list: 'GET /api/tasks',
        updateStatus: 'POST /api/tasks/:id/update-status',
        retry: 'POST /api/tasks/:id/retry',
        execute: 'POST /api/tasks/:id/execute',
      },
      integrations: {
        health: 'GET /api/integrations/health',
        ledger: 'GET /api/integrations/ledger',
        injectFailure: 'POST /api/integrations/inject-failure',
        resetDemo: 'POST /api/integrations/reset-demo',
      },
    },
  });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/policies', policyRoutes);
router.use('/plans', planRoutes);
router.use('/tasks', taskRoutes);
router.use('/integrations', integrationRoutes);
router.use('/', governanceRoutes);

export default router;
