while getopts "fg" opt; do
  case $opt in
    f)
      FLAG_F=true
      ;;
    *)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

if [ "$FLAG_F" = true ]; then
  docker rm -f $(docker ps -qa)
fi

echo "Running all containers..."
docker compose up -d --wait