import axios from 'axios';

async function initializeSonarQube() {
  const sonarqubeUrl = process.env.SONARQUBE_URL || 'http://localhost:9000';
  const sonarqubeToken = process.env.SONARQUBE_TOKEN;

  if (!sonarqubeToken) {
    throw new Error('SONARQUBE_TOKEN environment variable is required');
  }

  const api = axios.create({
    baseURL: sonarqubeUrl,
    headers: {
      'Authorization': `Bearer ${sonarqubeToken}`
    }
  });

  try {
    // Create project
    await api.post('/api/projects/create', {
      name: 'Analytics Service',
      project: 'analytics-service',
      visibility: 'private'
    });

    // Set up quality gates
    await api.post('/api/qualitygates/create_condition', {
      gateName: 'Sonar way',
      metric: 'coverage',
      op: 'LT',
      error: '80'
    });

    await api.post('/api/qualitygates/create_condition', {
      gateName: 'Sonar way',
      metric: 'code_smells',
      op: 'GT',
      error: '10'
    });

    // Set up quality profiles
    await api.post('/api/qualityprofiles/activate_rule', {
      key: 'typescript-sonar-way',
      rule: 'typescript:S1135', // TODO comments should be resolved
      severity: 'MAJOR'
    });

    console.log('SonarQube initialized successfully');
  } catch (error) {
    console.error('Error initializing SonarQube:', error);
    throw error;
  }
}

// Run initialization
initializeSonarQube().catch(console.error); 