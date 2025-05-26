// Google Analytics measurement ID
export const GA_MEASUREMENT_ID = "G-Z5Y0KBTS3B"

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Log specific events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    })
  }
}
