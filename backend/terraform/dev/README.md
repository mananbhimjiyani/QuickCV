# Terraform EKS (Free Tier) Setup

This directory provisions an AWS EKS (Kubernetes) cluster using only free-tier eligible resources.

## Usage

1. **Initialize Terraform:**
   ```sh
   terraform init
   ```
2. **Plan the changes:**
   ```sh
   terraform plan
   ```
3. **Apply the changes:**
   ```sh
   terraform apply
   ```
   (Review the plan and approve to proceed.)

4. **Configure kubectl:**
   After apply, configure your kubeconfig:
   ```sh
   aws eks --region us-east-1 update-kubeconfig --name quickcv-eks-free-tier
   ```

5. **Apply your Kubernetes manifests:**
   ```sh
   kubectl apply -f ../../../Kubernetes/
   ```

## Free Tier Tips
- Only 750 hours/month of t2.micro or t3.micro are free (shared across all EC2 in your account).
- Keep only 1 node running to avoid charges.
- Monitor your AWS billing dashboard regularly.
- S3, ECR, and CloudFront have free tier limits—monitor usage.
- Avoid using AWS Load Balancer (ALB/NLB) if possible; use NodePort or Ingress with a single EC2 node for dev/test.

## Cost Control
- Set `desiredCapacity`, `minSize`, and `maxSize` to 1 in your node group.
- Use `t2.micro` or `t3.micro` only.
- Clean up unused resources with `terraform destroy` when not needed.

---

**This setup is for development and testing only. For production, use larger nodes and more robust networking/security.** 