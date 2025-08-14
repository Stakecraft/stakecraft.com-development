<template>
  <div class="health-view">
    <div class="health-container">
      <h1>Site Health Status</h1>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Checking site status...</p>
      </div>

      <div v-else-if="error" class="error">
        <h2>❌ Health Check Failed</h2>
        <p>{{ error }}</p>
        <button @click="checkHealth" class="retry-btn">Retry</button>
      </div>

      <div v-else class="health-status">
        <div class="status-card">
          <div class="status-header">
            <h2>✅ Site Status: {{ healthData.status }}</h2>
          </div>

          <div class="status-details">
            <div class="detail-item">
              <span class="label">Timestamp:</span>
              <span class="value">{{ formatTimestamp(healthData.timestamp) }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Uptime:</span>
              <span class="value">{{ formatUptime(healthData.uptime) }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Environment:</span>
              <span class="value">{{ healthData.environment }}</span>
            </div>
          </div>

          <div class="last-checked">
            <p>Last checked: {{ formatTimestamp(new Date().toISOString()) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthView',
  data() {
    return {
      healthData: null,
      loading: true,
      error: null
    }
  },
  mounted() {
    this.checkHealth()
  },
  methods: {
    async checkHealth() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        this.healthData = await response.json()
      } catch (err) {
        this.error = err.message || 'Failed to check site health'
      } finally {
        this.loading = false
      }
    },

    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString()
    },

    formatUptime(seconds) {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${secs}s`
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`
      } else {
        return `${secs}s`
      }
    }
  }
}
</script>

<style scoped>
.health-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.health-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #d32f2f;
}

.error h2 {
  margin-bottom: 15px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #5a6fd8;
}

.status-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
  border-left: 4px solid #4caf50;
}

.status-header h2 {
  color: #2e7d32;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.status-details {
  text-align: left;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
  font-size: 16px;
}

.value {
  color: #333;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.last-checked {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .health-container {
    padding: 20px;
    margin: 10px;
  }

  h1 {
    font-size: 2rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .value {
    align-self: stretch;
    text-align: center;
  }
}
</style>
