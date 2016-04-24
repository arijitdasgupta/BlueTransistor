(defproject webhook "0.1.0-SNAPSHOT"
  :description "A Telegram webhook bot"
  :url "https://github.com/arijitdasgupta/iotaLiteJS"
  :license {:name "MIT"}
  :dependencies [
    [org.clojure/clojure "1.8.0"]
    [http-kit "2.1.18"]
    [org.clojure/data.json "0.2.6"]
    [de.ubercode.clostache/clostache "1.4.0"]]
  :main ^:skip-aot webhook.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
