import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:5000/api";

// Test data
const testContent = {
  mainnet: {
    type: "mainnet",
    title: "Test Solana Network",
    description: "This is a test mainnet network for testing purposes.",
    stakeCode: "test-validator-address-123",
    link: "https://test-explorer.com/validator/test-123",
    order: 1,
    isActive: true,
    metadata: {
      howToStake: "https://test-medium.com/how-to-stake-test",
    },
  },
  testnet: {
    type: "testnet",
    title: "Test Monad Network",
    description: "This is a test testnet network for testing purposes.",
    order: 1,
    isActive: true,
  },
  partnership: {
    type: "partnership",
    title: "Test Partnership",
    description: "This is a test partnership for testing purposes.",
    order: 1,
    isActive: true,
    partnership: {
      name: "Test Partner",
      description: "Test partnership description",
      website: "https://test-partner.com",
    },
  },
};

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    return {
      status: response.status,
      success: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message,
    };
  }
}

// Test authentication
async function testAuth() {
  console.log("\n🔐 Testing Authentication...");

  // Test login
  const loginResponse = await makeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username: "admin",
      password: "admin123",
    }),
  });

  if (loginResponse.success) {
    console.log("✅ Login successful");
    return loginResponse.data.token;
  } else {
    console.log("❌ Login failed:", loginResponse.data);
    return null;
  }
}

// Test content endpoints
async function testContent(token) {
  console.log("\n📝 Testing Content Endpoints...");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Test getting content
  const getContentResponse = await makeRequest("/content/mainnet", { headers });
  console.log(
    "📋 Get mainnet content:",
    getContentResponse.success ? "✅" : "❌"
  );

  // Test creating content (requires auth)
  if (token) {
    const createResponse = await makeRequest("/content/mainnet", {
      method: "POST",
      headers,
      body: JSON.stringify(testContent.mainnet),
    });
    console.log(
      "➕ Create mainnet content:",
      createResponse.success ? "✅" : "❌"
    );

    if (createResponse.success) {
      const contentId = createResponse.data._id;

      // Test updating content
      const updateResponse = await makeRequest(
        `/content/mainnet/${contentId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            title: "Updated Test Solana Network",
            description: "This is an updated test mainnet network.",
          }),
        }
      );
      console.log("✏️  Update content:", updateResponse.success ? "✅" : "❌");

      // Test deleting content
      const deleteResponse = await makeRequest(
        `/content/mainnet/${contentId}`,
        {
          method: "DELETE",
          headers,
        }
      );
      console.log("🗑️  Delete content:", deleteResponse.success ? "✅" : "❌");
    }
  }
}

// Test user endpoints
async function testUsers(token) {
  console.log("\n👥 Testing User Endpoints...");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Test getting users (requires admin)
  const getUsersResponse = await makeRequest("/users", { headers });
  console.log("📋 Get users:", getUsersResponse.success ? "✅" : "❌");

  // Test getting current user
  const getCurrentUserResponse = await makeRequest("/users/me", { headers });
  console.log(
    "👤 Get current user:",
    getCurrentUserResponse.success ? "✅" : "❌"
  );

  // Test creating user (requires admin)
  if (token) {
    const createUserResponse = await makeRequest("/users", {
      method: "POST",
      headers,
      body: JSON.stringify({
        username: "testuser",
        email: "test@example.com",
        password: "test123",
        role: "editor",
      }),
    });
    console.log("➕ Create user:", createUserResponse.success ? "✅" : "❌");
  }
}

// Test health endpoints
async function testHealth() {
  console.log("\n🏥 Testing Health Endpoints...");

  const healthResponse = await makeRequest("/health");
  console.log("💚 Basic health check:", healthResponse.success ? "✅" : "❌");

  const detailedHealthResponse = await makeRequest("/health/detailed");
  console.log(
    "📊 Detailed health check:",
    detailedHealthResponse.success ? "✅" : "❌"
  );
}

// Test admin endpoints
async function testAdmin(token) {
  console.log("\n⚙️  Testing Admin Endpoints...");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const dashboardResponse = await makeRequest("/admin/dashboard", { headers });
  console.log("📊 Admin dashboard:", dashboardResponse.success ? "✅" : "❌");

  const contentResponse = await makeRequest("/admin/content", { headers });
  console.log("📝 Admin content list:", contentResponse.success ? "✅" : "❌");

  const statsResponse = await makeRequest("/admin/system-info", { headers });
  console.log("📈 System info:", statsResponse.success ? "✅" : "❌");
}

// Main test function
async function runTests() {
  console.log("🧪 Starting API Tests...");
  console.log("========================");

  // Test health endpoints first
  await testHealth();

  // Test authentication
  const token = await testAuth();

  if (token) {
    // Test content endpoints
    await testContent(token);

    // Test user endpoints
    await testUsers(token);

    // Test admin endpoints
    await testAdmin(token);
  } else {
    console.log("⚠️  Skipping authenticated tests due to login failure");
  }

  console.log("\n✅ API Tests completed!");
  console.log("\n📋 Test Summary:");
  console.log("================");
  console.log("• Health endpoints: Basic system health checks");
  console.log("• Authentication: Login and token management");
  console.log("• Content management: CRUD operations for content");
  console.log("• User management: User administration");
  console.log("• Admin panel: Dashboard and system information");
}

// Run tests
runTests().catch(console.error);
