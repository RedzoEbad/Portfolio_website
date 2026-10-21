/**
 * DEVELOPMENT ONLY. Inserts clearly-labelled sample content so you can see every
 * layout before writing your own. Everything it creates has isSample: true and a
 * "[Sample]" title, and is shown with a "Sample content" badge on the site.
 *
 *   npm run db:seed:dev            # add samples
 *   npm run db:seed:dev -- --remove  # delete all sample content
 */
import { connect, disconnect } from "./_db";
import { BlogCategory, BlogPost, Category, Project } from "../src/lib/models";
import { CASE_STUDY_SECTIONS } from "../src/lib/content/constants";
import { readingTime } from "../src/lib/utils";

if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("✖ Refusing to seed sample data in production.");
  process.exit(1);
}

const md = {
  overview:
    "An **illustrative** case study showing how a multi-account AWS landing zone could be codified with Terraform. Replace this with your own project in the admin portal.\n\nThe example covers account vending, a shared networking hub, centralised logging and guardrails enforced in CI.",
  problem: "Teams were creating AWS accounts by hand. Networking, logging and IAM drifted between accounts, and nobody could say with confidence which guardrails applied where.",
  goals: "- Every account created from code, reviewed in a pull request\n- One hub VPC with Transit Gateway attachments per environment\n- Org-wide CloudTrail and Config delivered to a locked logging account\n- Policy checks that fail the pipeline, not a quarterly audit",
  architecture: "The organisation is split into **Security**, **Infrastructure**, **Workloads** and **Sandbox** OUs. A pipeline in the infrastructure account assumes a narrowly-scoped role into each target account.\n\nNetworking uses a hub-and-spoke model: workload VPCs attach to a Transit Gateway in the network account; egress is centralised through NAT and inspection.",
  challenges: "State locking collided when two pipelines targeted the same account. Investigation of the DynamoDB lock table showed the pipelines were keyed by environment, not by account.",
  solutions: "Split state per account *and* component, and serialised applies per account with a pipeline concurrency group.",
  security: "- No long-lived keys: OIDC federation from CI to a deploy role\n- SCPs deny disabling CloudTrail, leaving approved regions, and creating IAM users\n- `tfsec` and `checkov` run on every plan",
  observability: "Pipeline runs emit plan/apply duration and drift detections as metrics; a nightly `terraform plan` job alerts when drift appears.",
  lessons: "Module boundaries matter more than module count. Small modules with explicit inputs were easier to review than one flexible mega-module.",
  outcomes: "This is sample content, so there are no real outcomes. Record only results you can verify for your own projects.",
  future: "Move account vending to Account Factory for Terraform and add cost anomaly alerts per OU.",
};

async function main() {
  await connect();
  if (process.argv.includes("--remove")) {
    const [p, b] = await Promise.all([Project.deleteMany({ isSample: true }), BlogPost.deleteMany({ isSample: true })]);
    console.log(`✔ removed ${p.deletedCount} sample projects and ${b.deletedCount} sample articles`);
    await disconnect();
    return;
  }

  const iac = (await Category.findOne({ slug: "infrastructure-as-code" })) ?? (await Category.findOne());
  const k8s = (await Category.findOne({ slug: "kubernetes" })) ?? iac;

  const sections = CASE_STUDY_SECTIONS.map((s) => ({ type: s.type, title: s.title, enabled: true, content: (md as Record<string, string>)[s.type] ?? "" }));

  await Project.updateOne(
    { slug: "sample-terraform-aws-landing-zone" },
    {
      $set: {
        title: "[Sample] Terraform AWS landing zone",
        slug: "sample-terraform-aws-landing-zone",
        summary: "Illustrative example: a multi-account AWS foundation codified with Terraform, with guardrails enforced in CI.",
        category: iac?._id ?? null,
        tags: ["aws", "terraform", "landing-zone"],
        technologies: [
          { name: "Terraform", role: "Declares accounts, networking and IAM as reviewed code." },
          { name: "AWS Organizations", role: "OU structure and service control policies." },
          { name: "GitHub Actions", role: "Plan on pull request, apply on merge via OIDC." },
          { name: "Checkov", role: "Policy checks on every plan." },
        ],
        sections,
        implementationSteps: [
          { title: "Bootstrap state and the deploy role", body: "Create the S3 state bucket, DynamoDB lock table and an OIDC trust for CI." },
          { title: "Model the organisation", body: "Define OUs and SCPs in a dedicated `org` stack." },
          { title: "Build the network hub", body: "Transit Gateway, shared VPC endpoints and centralised egress." },
          { title: "Add guardrails to the pipeline", body: "Fail the plan on Checkov HIGH findings; require approval for prod applies." },
        ],
        codeSnippets: [
          {
            title: "Deny leaving approved regions",
            language: "hcl",
            caption: "Service control policy attached to the Workloads OU.",
            code: 'data "aws_iam_policy_document" "region_guard" {\n  statement {\n    effect    = "Deny"\n    actions   = ["*"]\n    resources = ["*"]\n    condition {\n      test     = "StringNotEquals"\n      variable = "aws:RequestedRegion"\n      values   = ["eu-west-1", "us-east-1"]\n    }\n  }\n}',
          },
        ],
        projectState: "experimental",
        status: "published",
        featured: true,
        isSample: true,
        publishedAt: new Date(),
      },
    },
    { upsert: true },
  );

  await Project.updateOne(
    { slug: "sample-kubernetes-observability" },
    {
      $set: {
        title: "[Sample] Kubernetes observability stack",
        slug: "sample-kubernetes-observability",
        summary: "Illustrative example: metrics, logs and traces for a cluster with OpenTelemetry, Prometheus and Grafana.",
        category: k8s?._id ?? null,
        tags: ["kubernetes", "observability"],
        technologies: [
          { name: "Kubernetes", role: "Workload platform." },
          { name: "OpenTelemetry", role: "Collector pipeline for traces and metrics." },
          { name: "Prometheus", role: "Metrics storage and alerting rules." },
          { name: "Grafana", role: "Dashboards and SLO views." },
        ],
        sections: CASE_STUDY_SECTIONS.filter((s) => ["overview", "architecture", "stack", "lessons"].includes(s.type)).map((s) => ({
          type: s.type,
          title: s.title,
          enabled: true,
          content: s.type === "overview" ? "Sample content showing a shorter case study with only a few sections enabled." : s.type === "lessons" ? "Start with the four golden signals before building custom dashboards." : s.type === "architecture" ? "Collectors run as a DaemonSet and forward to a gateway deployment." : "",
        })),
        projectState: "in-progress",
        status: "published",
        featured: true,
        isSample: true,
        publishedAt: new Date(Date.now() - 86400000 * 10),
      },
    },
    { upsert: true },
  );

  const terraform = await BlogCategory.findOneAndUpdate({ slug: "terraform" }, { $setOnInsert: { name: "Terraform", slug: "terraform", color: "#9d6bff" } }, { upsert: true, returnDocument: "after" });
  const lessons = await BlogCategory.findOneAndUpdate({ slug: "engineering-lessons" }, { $setOnInsert: { name: "Engineering Lessons", slug: "engineering-lessons", color: "#2ee6f5" } }, { upsert: true, returnDocument: "after" });

  const content =
    "> This is **sample content** created by the development seed script.\n\n## Why split state per account\n\nWhen state is keyed by environment, two pipelines can contend for the same lock.\n\n```hcl\nterraform {\n  backend \"s3\" {\n    key = \"accounts/${var.account_id}/network.tfstate\"\n  }\n}\n```\n\n## Takeaways\n\n- Key state by blast radius\n- Serialise applies per account\n";
  await BlogPost.updateOne(
    { slug: "sample-terraform-state-layout" },
    {
      $set: {
        title: "[Sample] Laying out Terraform state for many accounts",
        slug: "sample-terraform-state-layout",
        excerpt: "Illustrative article: why keying state by account and component avoids lock contention.",
        content,
        readingMinutes: readingTime(content),
        categories: [terraform!._id, lessons!._id],
        tags: ["terraform", "aws"],
        status: "published",
        isSample: true,
        publishedAt: new Date(),
      },
    },
    { upsert: true },
  );

  console.log("✔ sample content added (2 projects, 1 article, 2 blog categories). Remove with: npm run db:seed:dev -- --remove");
  await disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await disconnect();
  process.exit(1);
});
