import usePWAInstall from '../hooks/usePWAInstall';

const PWAInstallPrompt = () => {
  const { showInstallPrompt, installPWA, dismissInstallPrompt } = usePWAInstall();

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="w-max fixed left-1/2 top-5 transform -translate-x-1/2 bg-white shadow-[2px_2px_20px_gray] z-50 p-4 rounded-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/pwa-icon.png" 
            alt="App Icon" 
            className="w-10 h-10 rounded-lg"
          />
          <div className='space-y-1'>
            <h3 className="font-semibold text-sm text-gray-900">Install Mezba Shop</h3>
            <p className="text-xs text-gray-600">Add to home screen for quick access</p>
            <div className="flex space-x-2">
              <button
                onClick={dismissInstallPrompt}
                className="px-3 py-1.5 text-sm border rounded-md text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={installPWA}
                className="px-4 py-1.5 bg-[#FA6023] text-white text-sm rounded-lg hover:bg-[#e5541f] transition-colors font-medium"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
