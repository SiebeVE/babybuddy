/* Baby Buddy Screen Lock
 *
 * Provides keep-screen-on functionality for the timer page using the
 * Screen Wake Lock API with sessionStorage persistence
 */
BabyBuddy.ScreenLock = (function () {
  var wakeLock = null;
  const STORAGE_KEY = "babybuddy_keep_screen_on";

  var ScreenLock = {
    init: function () {
      var toggle = document.getElementById("keepScreenOnToggle");
      if (!toggle) {
        console.warn("BBScreenLock: Toggle element not found.");
        return false;
      }

      // Restore the saved state from sessionStorage
      var savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState === "true") {
        toggle.checked = true;
        ScreenLock.acquireWakeLock();
      }

      // Listen for toggle changes
      toggle.addEventListener("change", function () {
        if (this.checked) {
          ScreenLock.acquireWakeLock();
        } else {
          ScreenLock.releaseWakeLock();
        }
      });

      // Handle page visibility changes (e.g., app backgrounded)
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden && wakeLock === null && toggle.checked) {
          // Re-acquire wake lock if page becomes visible and toggle is still on
          ScreenLock.acquireWakeLock();
        }
      });

      // Clean up on page unload
      window.addEventListener("beforeunload", function () {
        ScreenLock.releaseWakeLock();
      });

      return true;
    },

    acquireWakeLock: async function () {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
          sessionStorage.setItem(STORAGE_KEY, "true");
          console.log("BBScreenLock: Wake lock acquired");

          // Handle wake lock release (e.g., browser loses focus)
          wakeLock.addEventListener("release", function () {
            console.log("BBScreenLock: Wake lock was released");
            wakeLock = null;
          });
        } else {
          console.warn("BBScreenLock: Wake Lock API not supported on this device");
        }
      } catch (err) {
        console.error("BBScreenLock: Failed to acquire wake lock", err.name, err.message);
      }
    },

    releaseWakeLock: async function () {
      try {
        if (wakeLock !== null) {
          await wakeLock.release();
          wakeLock = null;
          sessionStorage.setItem(STORAGE_KEY, "false");
          console.log("BBScreenLock: Wake lock released");
        }
      } catch (err) {
        console.error("BBScreenLock: Failed to release wake lock", err);
      }
    },
  };

  return ScreenLock;
})();
