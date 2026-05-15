# Cost Projection — GKE Cluster (0 nodes)

Starting: **15 May 2026** | Consumed: **$181** | Remaining free credits: **$119**
Rate: **~$3.30/day** (GKE control plane + LB + monitoring)

| Date | Consumed | Remaining |
|------|----------|-----------|
| 15 May | $181.00 | $119.00 |
| 16 May | $184.30 | $115.70 |
| 17 May | $187.60 | $112.40 |
| 18 May | $190.90 | $109.10 |
| 19 May | $194.20 | $105.80 |
| 20 May | $197.50 | $102.50 |
| 21 May | $200.80 | $99.20 |
| 22 May | $204.10 | $95.90 |
| 23 May | $207.40 | $92.60 |
| 24 May | $210.70 | $89.30 |
| 25 May | $214.00 | $86.00 |
| 26 May | $217.30 | $82.70 |
| 27 May | $220.60 | $79.40 |
| 28 May | $223.90 | $76.10 |
| 29 May | $227.20 | $72.80 |
| 30 May | $230.50 | $69.50 |
| 31 May | $233.80 | $66.20 |
| 1 Jun | $237.10 | $62.90 |
| 2 Jun | $240.40 | $59.60 |
| 3 Jun | $243.70 | $56.30 |
| 4 Jun | $247.00 | $53.00 |
| 5 Jun | $250.30 | $49.70 |
| 6 Jun | $253.60 | $46.40 |
| 7 Jun | $256.90 | $43.10 |
| 8 Jun | $260.20 | $39.80 |
| 9 Jun | $263.50 | $36.50 |
| 10 Jun | $266.80 | $33.20 |
| 11 Jun | $270.10 | $29.90 |
| 12 Jun | $273.40 | $26.60 |
| 13 Jun | $276.70 | $23.30 |
| 14 Jun | $280.00 | $20.00 |
| 15 Jun | $283.30 | $16.70 |
| 16 Jun | $286.60 | $13.40 |
| 17 Jun | $289.90 | $10.10 |
| 18 Jun | $293.20 | $6.80 |
| 19 Jun | $296.50 | $3.50 |
| 20 Jun | $299.80 | $0.20 |
| **21 Jun** | **$303.10** | **$0.00** ⚠️ Credits exhausted |
| 22 Jun | $306.40 | $0.00 |
| 23 Jun | $309.70 | $0.00 |
| 24 Jun | $313.00 | $0.00 |
| 25 Jun | $316.30 | $0.00 |
| 26 Jun | $319.60 | $0.00 |
| **27 Jun (soutenance)** | **$322.90** | **$0.00** |

**Total cost by 27 June: ~$323**
**Free credits: $300**
**Out of pocket: ~$23**

## To avoid paying anything

Delete the load balancer/ingress to save ~$0.60/day:

```bash
kubectl delete ingress employee-ingress -n employee-platform
```

This extends credits to ~24 June, shortfall drops to ~$10.

## On 27 June — restore everything

```bash
gcloud container clusters resize dev-cloud-native-employee-gke \
  --node-pool=dev-cloud-native-node-pool --num-nodes=2 \
  --region=europe-west1 --project=cloudappproject-494314
```

Wait ~3 min, then verify:
```bash
kubectl get pods -n employee-platform
```
