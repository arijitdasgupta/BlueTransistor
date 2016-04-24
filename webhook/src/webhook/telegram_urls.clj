(ns webhook.telegram-urls
  (:gen-class))

(use 'clostache.parser)

(defn- bot-url
  [token]
  (render "https://api.telegram.org/bot{{token}}/" {:token token}))

(defn- bot-action
  [token action]
  (clojure.string/join  "" [(bot-url token) action]))

(defn get-me
  [token]
  (bot-action token "getMe"))

(defn get-updates
  [token]
  (bot-action token "getUpdates"))

(defn send-message
  [token]
  (bot-action token "sendMessage"))
