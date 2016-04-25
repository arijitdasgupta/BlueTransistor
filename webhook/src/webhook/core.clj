(ns webhook.core
  (:gen-class)
  (:require [org.httpkit.client :as http])
  (:require [clojure.data.json :as json])
  (:require [webhook.telegram-urls :as telegram-urls]))

(defn read-config
  []
  (let [the-config-str (slurp "../config.json")] ; Reading the config file
    (if the-config-str (json/read-str the-config-str) nil)))

(defn start-getting-updates
  [token]
  nil)

(defn get-updates
  []
  nil)

(defn- run
  []
  (let [botToken (get (read-config) "telegramBotToken")]
    (println @(http/get (telegram-urls/get-me botToken)))))

(defn -main
  "The main entry"
  [& args]
  (run))
