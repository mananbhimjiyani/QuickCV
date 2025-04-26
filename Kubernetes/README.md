# Kubernetes Manifests with Kustomize

This directory uses [Kustomize](https://kustomize.io/) for flexible, template-free Kubernetes deployments.

## Usage

1. **Edit the overlay patch**
   - Update `overlay-dev.yaml` with your desired image tags and replica counts for backend and frontend.

2. **Deploy with Kustomize**
   ```sh
   kubectl apply -k .
   ```
   This will apply the base manifests and patch them with the overlay.

3. **To update images or replicas**
   - Change the values in `overlay-dev.yaml` and re-run the `kubectl apply -k .` command.

## Example overlay-dev.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickcv-backend
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: quickcv-backend
        image: <your-backend-image>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickcv-frontend
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: quickcv-frontend
        image: <your-frontend-image>
```

## Helm Chart Usage

1. **Install Helm** if not already installed:
   https://helm.sh/docs/intro/install/

2. **Deploy with Helm:**
   ```sh
   helm install quickcv .
   # or upgrade
   helm upgrade quickcv .
   ```

3. **Blue/Green or Canary Deployments:**
   - Use the `track` value in `values.yaml` (e.g., `stable`, `green`, `canary`) and deploy two releases with different tracks.
   - Route traffic using a service or ingress based on the `track` label.

4. **Monitoring/Alerting:**
   - The chart includes Prometheus `ServiceMonitor` resources for both frontend and backend.
   - Make sure Prometheus Operator is installed in your cluster.
   - Alerts can be configured in Prometheus/Alertmanager as needed.

---

**For more advanced use cases, consider using Helm charts.** 