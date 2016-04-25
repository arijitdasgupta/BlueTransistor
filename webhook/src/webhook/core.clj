(ns webhook.core
  (:gen-class)
  (:require [org.httpkit.client :as http])
  (:require [clojure.data.json :as json])
  (:require [webhook.telegram-urls :as telegram-urls]))

(def bot-token
  nil)

(defn read-config
  []
  (let [the-config-str (slurp "../config.json")] ; Reading the config file
    (if the-config-str (json/read-str the-config-str) nil)))

(defn start-getting-updates
  [token]
  nil)

(defn get-updates
  [offset]
  (let [
    body (json/write-str {"timeout" 10 "offset" offset "limit" 100})
    options {
      :url (telegram-urls/get-updates bot-token)
      :method :get
      :headers {
        "Content-type" "application/json"}
      :body body}]
    @(http/request options)))

(defn- run
  []
  (let [bot-token (get (read-config) "telegramBotToken")]
    (def bot-token bot-token)
    ; (println @(http/get (telegram-urls/get-me bot-token)))
    (println (get-updates ""))))

(defn -main
  "The main entry"
  [& args]
  (run))
