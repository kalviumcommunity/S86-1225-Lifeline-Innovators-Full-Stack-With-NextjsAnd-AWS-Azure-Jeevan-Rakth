/**
 * RBAC Test Script
 *
 * This script tests the RBAC implementation to ensure all components work correctly.
 * Run with: npx ts-node scripts/test-rbac.ts
 */

import {
  roles,
  hasPermission,
  hasResourcePermission,
  isAdmin,
  canModify,
  isValidRole,
  type Role,
  type Permission,
} from "../src/config/roles";

console.log("🔐 RBAC Implementation Test\n");
console.log("=".repeat(60));

// Test 1: Role Configuration
console.log("\n✅ Test 1: Role Configuration");
console.log("-".repeat(60));
console.log("Roles:", Object.keys(roles));
Object.entries(roles).forEach(([role, permissions]) => {
  console.log(`  ${role}:`, permissions.join(", "));
});

// Test 2: Permission Checks
console.log("\n✅ Test 2: Permission Checks");
console.log("-".repeat(60));

const testCases: Array<{
  role: Role;
  permission: Permission;
  expected: boolean;
}> = [
  { role: "admin", permission: "delete", expected: true },
  { role: "editor", permission: "delete", expected: false },
  { role: "viewer", permission: "update", expected: false },
  { role: "viewer", permission: "read", expected: true },
  { role: "user", permission: "read", expected: true },
  { role: "user", permission: "create", expected: false },
];

let passed = 0;
let failed = 0;

testCases.forEach(({ role, permission, expected }) => {
  const result = hasPermission(role, permission);
  const status = result === expected ? "✅" : "❌";

  if (result === expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(
    `  ${status} ${role} -> ${permission}: ${result} (expected: ${expected})`
  );
});

// Test 3: Resource-Specific Permissions
console.log("\n✅ Test 3: Resource-Specific Permissions");
console.log("-".repeat(60));

const resourceTests = [
  {
    role: "admin" as Role,
    resource: "users" as const,
    permission: "delete" as Permission,
    expected: true,
  },
  {
    role: "editor" as Role,
    resource: "users" as const,
    permission: "delete" as Permission,
    expected: false,
  },
  {
    role: "editor" as Role,
    resource: "projects" as const,
    permission: "update" as Permission,
    expected: true,
  },
  {
    role: "viewer" as Role,
    resource: "tasks" as const,
    permission: "read" as Permission,
    expected: true,
  },
  {
    role: "viewer" as Role,
    resource: "tasks" as const,
    permission: "create" as Permission,
    expected: false,
  },
];

resourceTests.forEach(({ role, resource, permission, expected }) => {
  const result = hasResourcePermission(role, resource, permission);
  const status = result === expected ? "✅" : "❌";

  if (result === expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(
    `  ${status} ${role} -> ${resource}.${permission}: ${result} (expected: ${expected})`
  );
});

// Test 4: Helper Functions
console.log("\n✅ Test 4: Helper Functions");
console.log("-".repeat(60));

const helperTests = [
  { fn: "isAdmin", role: "admin" as Role, expected: true },
  { fn: "isAdmin", role: "editor" as Role, expected: false },
  { fn: "canModify", role: "admin" as Role, expected: true },
  { fn: "canModify", role: "editor" as Role, expected: true },
  { fn: "canModify", role: "viewer" as Role, expected: false },
];

helperTests.forEach(({ fn, role, expected }) => {
  let result: boolean;

  if (fn === "isAdmin") {
    result = isAdmin(role);
  } else {
    result = canModify(role);
  }

  const status = result === expected ? "✅" : "❌";

  if (result === expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(
    `  ${status} ${fn}('${role}'): ${result} (expected: ${expected})`
  );
});

// Test 5: Role Validation
console.log("\n✅ Test 5: Role Validation");
console.log("-".repeat(60));

const roleValidationTests = [
  { role: "admin", expected: true },
  { role: "editor", expected: true },
  { role: "viewer", expected: true },
  { role: "user", expected: true },
  { role: "superuser", expected: false },
  { role: "guest", expected: false },
];

roleValidationTests.forEach(({ role, expected }) => {
  const result = isValidRole(role);
  const status = result === expected ? "✅" : "❌";

  if (result === expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(
    `  ${status} isValidRole('${role}'): ${result} (expected: ${expected})`
  );
});

// Test Summary
console.log("\n" + "=".repeat(60));
console.log("📊 Test Summary");
console.log("=".repeat(60));
console.log(`  Total Tests: ${passed + failed}`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(
  `  Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
);

if (failed === 0) {
  console.log(
    "\n🎉 All tests passed! RBAC implementation is working correctly.\n"
  );
  process.exit(0);
} else {
  console.log("\n⚠️  Some tests failed. Please review the implementation.\n");
  process.exit(1);
}
