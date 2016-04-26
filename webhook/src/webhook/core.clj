(ns webhook.core
  (:gen-class)
  (:require [clojure.data.json :as json])
  (:require [webhook.telegram :as telegram])
  (:require [webhook.liteserver :as liteserver])
  (:require [webhook.messages :as messages]))

(def bot-token
  nil)

(def lite-server
  nil)

(defn- read-config
  []
  (let [the-config-str (slurp "../config.json")] ; Reading the config file
    (if the-config-str (json/read-str the-config-str) nil)))

(defn- get-updates
  [& args]
  (let [
    offset (first args)
    data (telegram/get-updates bot-token offset)
    result (get data "result")]
  (if (messages/any-updates? data)
    (do
      (messages/do-the-thang result
        #(messages/send-message bot-token %1 %2)
        #(liteserver/send-update lite-server %))
      (future (Thread/sleep telegram/request-interval) (get-updates (messages/get-offset result))))
    (future (Thread/sleep telegram/request-interval) (get-updates nil)))))

(defn- run
  []
  (let [
    bot-token (get (read-config) "telegramBotToken" "blah")
    lite-server (get (read-config) "liteServer" "http://localhost:7000")]
    (def bot-token bot-token)
    (def lite-server lite-server)
    (get-updates)))

(defn -main
  "The main entry-point"
  [& args]
  (run))
