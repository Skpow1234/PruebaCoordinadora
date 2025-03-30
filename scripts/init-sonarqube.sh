#!/bin/bash

# Wait for SonarQube to be ready
echo "Waiting for SonarQube to be ready..."
while ! curl -s http://$SONARQUBE_URL/api/system/status | grep -q '"status":"UP"'; do
  sleep 1
done

# Generate token if not provided
if [ -z "$SONARQUBE_TOKEN" ]; then
  SONARQUBE_TOKEN=$(curl -s -X POST -u admin:admin \
    -H "Content-Type: application/x-www-form-urlencoded" \
    "http://$SONARQUBE_URL/api/users/generate_token" \
    -d "name=logistics-token" \
    -d "type=GLOBAL_ANALYSIS" | jq -r '.token')
fi

# Create project
curl -s -X POST \
  -H "Authorization: Bearer $SONARQUBE_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://$SONARQUBE_URL/api/projects/create" \
  -d "name=Logistics System" \
  -d "project=logistics-system" \
  -d "visibility=private"

# Set up quality gates
curl -s -X POST \
  -H "Authorization: Bearer $SONARQUBE_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://$SONARQUBE_URL/api/qualitygates/create_condition" \
  -d "gateName=Sonar way" \
  -d "metric=coverage" \
  -d "op=LT" \
  -d "error=80"

curl -s -X POST \
  -H "Authorization: Bearer $SONARQUBE_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://$SONARQUBE_URL/api/qualitygates/create_condition" \
  -d "gateName=Sonar way" \
  -d "metric=code_smells" \
  -d "op=GT" \
  -d "error=10"

# Set up quality profiles
curl -s -X POST \
  -H "Authorization: Bearer $SONARQUBE_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "http://$SONARQUBE_URL/api/qualityprofiles/activate_rule" \
  -d "key=typescript-sonar-way" \
  -d "rule=typescript:S1135" \
  -d "severity=MAJOR"

echo "SonarQube initialized successfully" 