/**
 * Security Headers Testing Script
 *
 * This script tests all security headers on your deployed or local application.
 * It verifies HSTS, CSP, CORS, and other security headers are properly configured.
 *
 * Usage:
 *   node scripts/test-security-headers.js
 *   TEST_URL=https://your-domain.com node scripts/test-security-headers.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const https = require("https");
const http = require("http");

// Test URL - defaults to localhost
const testUrl = process.env.TEST_URL || "http://localhost:3000";
const isHttps = testUrl.startsWith("https");
const protocol = isHttps ? https : http;

console.log("🔍 Security Headers Testing\n");
console.log(`Testing URL: ${testUrl}\n`);
console.log("=".repeat(80) + "\n");

// Required security headers
const requiredHeaders = {
  "strict-transport-security": {
    name: "Strict-Transport-Security (HSTS)",
    required: true,
    check: (value) => {
      if (!value) return { valid: false, message: "Missing" };
      const hasMaxAge = /max-age=\d+/.test(value);
      const hasSubDomains = value.includes("includeSubDomains");
      const hasPreload = value.includes("preload");

      if (!hasMaxAge) return { valid: false, message: "Missing max-age" };
      if (!hasSubDomains)
        return { valid: true, message: "Warning: missing includeSubDomains" };
      if (!hasPreload)
        return { valid: true, message: "Info: not preload-ready" };

      return { valid: true, message: "Perfect!" };
    },
  },
  "content-security-policy": {
    name: "Content-Security-Policy (CSP)",
    required: true,
    check: (value) => {
      if (!value) return { valid: false, message: "Missing" };
      const hasDefaultSrc = value.includes("default-src");
      const hasScriptSrc = value.includes("script-src");

      if (!hasDefaultSrc)
        return { valid: false, message: "Missing default-src" };
      if (!hasScriptSrc)
        return { valid: true, message: "Warning: no script-src" };

      // Check for unsafe directives
      const hasUnsafeInline = value.includes("'unsafe-inline'");
      const hasUnsafeEval = value.includes("'unsafe-eval'");

      if (hasUnsafeInline && hasUnsafeEval) {
        return {
          valid: true,
          message: "Warning: contains unsafe-inline and unsafe-eval",
        };
      }
      if (hasUnsafeInline) {
        return {
          valid: true,
          message: "Info: contains unsafe-inline (common for CSS frameworks)",
        };
      }

      return { valid: true, message: "Good!" };
    },
  },
  "x-frame-options": {
    name: "X-Frame-Options",
    required: true,
    check: (value) => {
      if (!value) return { valid: false, message: "Missing" };
      const validValues = ["DENY", "SAMEORIGIN"];
      const isValid = validValues.some((v) => value.toUpperCase().includes(v));
      return {
        valid: isValid,
        message: isValid ? "Good!" : "Invalid value (use DENY or SAMEORIGIN)",
      };
    },
  },
  "x-content-type-options": {
    name: "X-Content-Type-Options",
    required: true,
    check: (value) => {
      if (!value) return { valid: false, message: "Missing" };
      const isValid = value.toLowerCase() === "nosniff";
      return {
        valid: isValid,
        message: isValid ? "Good!" : 'Should be "nosniff"',
      };
    },
  },
  "referrer-policy": {
    name: "Referrer-Policy",
    required: true,
    check: (value) => {
      if (!value) return { valid: false, message: "Missing" };
      return { valid: true, message: "Present" };
    },
  },
  "permissions-policy": {
    name: "Permissions-Policy",
    required: false,
    check: (value) => {
      if (!value) return { valid: true, message: "Optional - not set" };
      return { valid: true, message: "Present" };
    },
  },
  "x-xss-protection": {
    name: "X-XSS-Protection",
    required: false,
    check: (value) => {
      if (!value) return { valid: true, message: "Optional - not set" };
      return { valid: true, message: "Present (legacy)" };
    },
  },
};

// Make HTTP request
protocol
  .get(testUrl, (res) => {
    console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}\n`);

    let score = 0;
    let maxScore = 0;
    const issues = [];
    const warnings = [];

    // Check each header
    Object.keys(requiredHeaders).forEach((headerKey) => {
      const config = requiredHeaders[headerKey];
      const value = res.headers[headerKey];
      const result = config.check(value);

      if (config.required) {
        maxScore += 10;
        if (result.valid) {
          score += 10;
        } else {
          score += 0;
          issues.push(`${config.name}: ${result.message}`);
        }
      }

      // Display result
      const icon = result.valid ? "✅" : "❌";
      const requiredLabel = config.required ? "[REQUIRED]" : "[OPTIONAL]";
      console.log(`${icon} ${config.name} ${requiredLabel}`);
      console.log(`   Value: ${value || "NOT SET"}`);
      console.log(`   Status: ${result.message}`);
      console.log();

      if (
        result.message.startsWith("Warning") ||
        result.message.startsWith("Info")
      ) {
        warnings.push(`${config.name}: ${result.message}`);
      }
    });

    // Test CORS (if applicable)
    console.log("=".repeat(80));
    console.log("\n🌐 CORS Headers (for API routes):");
    console.log(
      "   Note: CORS headers typically appear only on /api/* routes\n"
    );

    const corsHeaders = [
      "access-control-allow-origin",
      "access-control-allow-methods",
      "access-control-allow-headers",
      "access-control-allow-credentials",
    ];

    corsHeaders.forEach((header) => {
      const value = res.headers[header];
      const icon = value ? "✅" : "⚠️";
      console.log(`${icon} ${header}: ${value || "Not set on this route"}`);
    });

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("\n📈 SECURITY SCORE\n");
    console.log(
      `   Score: ${score}/${maxScore} (${Math.round((score / maxScore) * 100)}%)`
    );

    if (score === maxScore && warnings.length === 0) {
      console.log(`   Grade: A+ 🌟`);
    } else if (score === maxScore) {
      console.log(`   Grade: A (with warnings)`);
    } else if (score >= maxScore * 0.8) {
      console.log(`   Grade: B`);
    } else if (score >= maxScore * 0.6) {
      console.log(`   Grade: C`);
    } else {
      console.log(`   Grade: D`);
    }

    // Issues
    if (issues.length > 0) {
      console.log("\n❌ CRITICAL ISSUES:\n");
      issues.forEach((issue) => console.log(`   • ${issue}`));
    }

    // Warnings
    if (warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:\n");
      warnings.forEach((warning) => console.log(`   • ${warning}`));
    }

    // Recommendations
    console.log("\n💡 RECOMMENDATIONS:\n");
    if (score < maxScore) {
      console.log(
        "   • Fix all critical issues before deploying to production"
      );
      console.log("   • Review SECURITY_HEADERS.md for implementation details");
    }
    if (warnings.some((w) => w.includes("unsafe-inline"))) {
      console.log(
        "   • Consider removing unsafe-inline from CSP in production"
      );
      console.log("   • Use nonces or hashes for dynamic scripts");
    }
    if (!res.headers["strict-transport-security"]?.includes("preload")) {
      console.log(
        '   • Consider adding "preload" to HSTS once HTTPS is stable'
      );
      console.log("   • Submit to https://hstspreload.org after enabling");
    }

    // Next steps
    console.log("\n📝 NEXT STEPS:\n");
    console.log("   1. Test with online tools:");
    console.log("      • https://securityheaders.com");
    console.log("      • https://observatory.mozilla.org");
    console.log(
      "   2. Test API routes specifically: /api/users, /api/auth/login"
    );
    console.log("   3. Verify CORS with different origins");
    console.log(
      "   4. Document any third-party integrations requiring CSP updates"
    );

    console.log("\n" + "=".repeat(80));
    console.log("\nTest completed at:", new Date().toISOString());
  })
  .on("error", (err) => {
    console.error("❌ Error testing headers:", err.message);
    console.error("\nTroubleshooting:");
    console.error("   • Is your app running? Try: npm run dev");
    console.error("   • Check the TEST_URL is correct:", testUrl);
    console.error("   • Ensure no firewall is blocking the connection");
    process.exit(1);
  });
