class JarvisClient {
  constructor(dnsUrl) {
    this.dnsUrl = dnsUrl;
    this.serviceCache = {};
  }

  async getServiceUrl(serviceType) {
    try {
      // Validate DNS URL
      if (!this.dnsUrl) {
        throw new Error('DNS URL is not configured');
      }

      // Add http:// if not present
      let url = this.dnsUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }

      const response = await fetch(
        `${url}/service/${serviceType}?requirements={"busy":false}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `DNS lookup failed: ${response.statusText}`);
        } else {
          throw new Error(`DNS server error: ${response.status} ${response.statusText}`);
        }
      }

      const text = await response.text();
      let serviceData;
      try {
        serviceData = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from DNS server: ${text.substring(0, 100)}...`);
      }

      if (!serviceData.url) {
        throw new Error('DNS response missing URL field');
      }

      return serviceData.url;
    } catch (error) {
      console.error('DNS lookup failed:', error);
      throw new Error(`DNS connection failed: ${error.message}`);
    }
  }

  async sendPrompt(text, context = {}) {
    try {
      // Get main server URL from DNS
      const mainServerUrl = await this.getServiceUrl('main');

      // Prepare the command payload
      const payload = {
        text,
        context: context || {},
      };

      // Send request to main server
      const response = await fetch(`${mainServerUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to send prompt: ${response.statusText}`);
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Failed to send prompt:', error);
      throw error;
    }
  }
}

export default JarvisClient; 