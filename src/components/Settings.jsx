import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import JarvisClient from '../services/jarvisClient';

const Settings = () => {
  const [settings, setSettings] = useState({
    dnsServer: localStorage.getItem('jarvis_dns_server') || '',
    pluginsUrl: localStorage.getItem('jarvis_plugins_url') || '',
    themesUrl: localStorage.getItem('jarvis_themes_url') || '',
  });

  const [status, setStatus] = useState({
    message: '',
    type: 'info', // 'info', 'success', 'error'
    details: '' // Additional details for errors
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value.trim() // Trim whitespace from input
    }));
  };

  const validateUrl = (url) => {
    if (!url) return true; // Empty URL is valid (optional field)
    try {
      new URL(url.startsWith('http') ? url : `http://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatDnsUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://${url}`;
  };

  const testDnsConnection = async () => {
    setIsTestingConnection(true);
    setStatus({ message: 'Testing DNS connection...', type: 'info' });
    
    try {
      const formattedUrl = formatDnsUrl(settings.dnsServer);
      const jarvis = new JarvisClient(formattedUrl);
      
      // Test connection by trying to get main service URL
      await jarvis.getServiceUrl('main');
      
      setStatus({ 
        message: 'DNS connection successful! JARVIS services are accessible.', 
        type: 'success' 
      });
      return true;
    } catch (error) {
      setStatus({ 
        message: 'DNS connection failed', 
        type: 'error',
        details: error.message
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    // Reset status
    setStatus({ message: '', type: 'info' });

    // Validate URLs
    if (settings.dnsServer && !validateUrl(settings.dnsServer)) {
      setStatus({ 
        message: 'Invalid DNS Server URL', 
        type: 'error',
        details: 'Please enter a valid URL (e.g., localhost:9000 or http://localhost:9000)'
      });
      return;
    }
    if (settings.pluginsUrl && !validateUrl(settings.pluginsUrl)) {
      setStatus({ message: 'Invalid Plugins URL', type: 'error' });
      return;
    }
    if (settings.themesUrl && !validateUrl(settings.themesUrl)) {
      setStatus({ message: 'Invalid Themes URL', type: 'error' });
      return;
    }

    // Test DNS connection before saving if DNS server is configured
    if (settings.dnsServer) {
      const isConnected = await testDnsConnection();
      if (!isConnected) return;
    }

    // Save to localStorage
    localStorage.setItem('jarvis_dns_server', settings.dnsServer);
    localStorage.setItem('jarvis_plugins_url', settings.pluginsUrl);
    localStorage.setItem('jarvis_themes_url', settings.themesUrl);

    setStatus({ message: 'Settings saved successfully', type: 'success' });
  };

  return (
    <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[800px] min-h-[600px] bg-gradient-to-b from-blue-900/10 to-blue-950/5 border border-blue-500/30 p-8 z-20 rounded-lg backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[#00a8ff] text-2xl font-medium">System Settings</h2>
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[#00a8ff]/20 hover:bg-[#00a8ff]/30 border border-[#00a8ff]/50 rounded-lg text-[#00a8ff] font-medium transition-colors"
          >
            Back to Home
          </motion.button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* DNS Server Configuration */}
        <div className="space-y-2">
          <label className="text-[#00a8ff] block text-sm font-medium">
            JARVIS DNS Server URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="dnsServer"
              value={settings.dnsServer}
              onChange={handleInputChange}
              className="flex-1 bg-blue-900/10 border border-blue-500/30 rounded-lg px-4 py-2 text-[#00a8ff] focus:outline-none focus:border-[#00a8ff] transition-colors"
              placeholder="https://jarvis-dns.example.com"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testDnsConnection}
              disabled={isTestingConnection || !settings.dnsServer}
              className="px-4 py-2 bg-[#00a8ff]/20 hover:bg-[#00a8ff]/30 border border-[#00a8ff]/50 rounded-lg text-[#00a8ff] font-medium transition-colors disabled:opacity-50"
            >
              {isTestingConnection ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-t-transparent border-[#00a8ff] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Testing...
                </span>
              ) : (
                'Test Connection'
              )}
            </motion.button>
          </div>
        </div>

        {/* Plugins Configuration */}
        <div className="space-y-2">
          <label className="text-[#00a8ff] block text-sm font-medium">
            GitHub Actions Plugins URL
          </label>
          <input
            type="url"
            name="pluginsUrl"
            value={settings.pluginsUrl}
            onChange={handleInputChange}
            className="w-full bg-blue-900/10 border border-blue-500/30 rounded-lg px-4 py-2 text-[#00a8ff] focus:outline-none focus:border-[#00a8ff] transition-colors"
            placeholder="https://github.com/user/jarvis-plugins/actions"
          />
        </div>

        {/* Themes Configuration */}
        <div className="space-y-2">
          <label className="text-[#00a8ff] block text-sm font-medium">
            GitHub Actions Themes URL
          </label>
          <input
            type="url"
            name="themesUrl"
            value={settings.themesUrl}
            onChange={handleInputChange}
            className="w-full bg-blue-900/10 border border-blue-500/30 rounded-lg px-4 py-2 text-[#00a8ff] focus:outline-none focus:border-[#00a8ff] transition-colors"
            placeholder="https://github.com/user/jarvis-themes/actions"
          />
        </div>

        {/* Status Message */}
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              status.type === 'error' 
                ? 'bg-red-500/20 text-red-400' 
                : status.type === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            <div className="font-medium">{status.message}</div>
            {status.details && (
              <div className="text-sm mt-1 opacity-80">{status.details}</div>
            )}
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveSettings}
          className="w-full bg-[#00a8ff]/20 hover:bg-[#00a8ff]/30 border border-[#00a8ff]/50 rounded-lg px-4 py-3 text-[#00a8ff] font-medium transition-colors mt-8"
        >
          Save Settings
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;
