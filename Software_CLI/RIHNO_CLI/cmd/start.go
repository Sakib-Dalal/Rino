package cmd

import (
	"encoding/csv"
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/fatih/color"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var verbose bool
var local bool
var email string

var startCmd = &cobra.Command{
	Use:   "start",
	Short: color.YellowString("This command will start sending data logs."),
	Run:   startLogs,
}

func startLogs(cmd *cobra.Command, args []string) {
	// 1. Config Loading with Viper
	userHomePath, _ := os.UserHomeDir()
	configPath := filepath.Join(userHomePath, ".rihno.yaml")

	v := viper.New()
	v.SetConfigFile(configPath)

	// Ensure file is readable and exists
	if err := v.ReadInConfig(); err != nil {
		log.Fatalf(color.RedString("Error reading config: %v. Ensure ~/.rihno.yaml exists and has 644 permissions."), err)
	}

	var rihnoConfig Config
	if err := v.Unmarshal(&rihnoConfig); err != nil {
		log.Fatalf(color.RedString("Failed to parse config: %v"), err)
	}

	// 2. Authentication
	agentVerify, err := VerifyConfig(rihnoConfig)
	if err != nil || !agentVerify {
		log.Fatalf(color.RedString("Agent verification failed. Check your API key and network connection."))
		return
	}

	email := v.GetString("userEmail")
	agentName = v.GetString("agentName")
	agentType = v.GetString("agentType")

	// 3. Backgrounding Logic
	if !verbose && os.Getenv("RIHNO_BG") != "true" {
		executable, _ := os.Executable()
		bgCmd := exec.Command(executable, "start")
		if local {
			bgCmd.Args = append(bgCmd.Args, "--local")
		}
		bgCmd.Env = append(os.Environ(), "RIHNO_BG=true")

		if err := bgCmd.Start(); err != nil {
			fmt.Printf(color.RedString("Failed to start background process: %v\n", err))
			return
		}

		fmt.Printf(color.GreenString("RIHNO agent verified.\n"))
		fmt.Printf(color.YellowString("# RIHNO agent running in background (PID: %d)\n", bgCmd.Process.Pid))
		os.Exit(0)
	}

	// 4. Runtime Setup
	pid := os.Getpid()
	pidPath := filepath.Join(os.TempDir(), "rihno.pid")
	_ = os.WriteFile(pidPath, []byte(strconv.Itoa(pid)), 0644)

	var csvFile *os.File
	if local {
		csvPath := filepath.Join(userHomePath, "rihno_metrics.csv")
		var err error
		// Open once for performance
		csvFile, err = os.OpenFile(csvPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Printf(color.RedString("CSV Error: %v"), err)
		} else {
			defer csvFile.Close()
		}
	}

	// 5. Main Execution Loop with Reconnection
	serverAddr := "192.168.1.10:8081"
	for {
		conn, err := net.DialTimeout("tcp", serverAddr, 5*time.Second)
		if err != nil {
			if verbose {
				log.Printf(color.RedString("Dealer offline. Retrying in 5s..."))
			}
			time.Sleep(5 * time.Second)
			continue
		}

		for {
			cpuVal := getCPUmatrix()

			if local && csvFile != nil {
				saveToCSV(csvFile, cpuVal)
			}

			// Send data with a newline for the dealer to parse
			_, err := fmt.Fprintf(conn, "%.5f %s %s %s\n", cpuVal, email, agentName, agentType)
			if err != nil {
				log.Println("Connection to dealer lost. Reconnecting...")
				conn.Close()
				break
			}

			time.Sleep(2 * time.Second)
		}
	}
}

func getCPUmatrix() float64 {
	percentage, err := cpu.Percent(time.Second, false)
	if err != nil || len(percentage) == 0 {
		return 0
	}

	val := percentage[0]
	timestamp := time.Now().Format("15:04:05")

	if verbose {
		fmt.Printf("[%s] %s CPU Usage: %.2f%%\n", timestamp, color.BlueString("LOG"), val)
	}
	return val
}

func saveToCSV(file *os.File, cpuValue float64) {
	writer := csv.NewWriter(file)
	row := []string{time.Now().Format(time.RFC3339), fmt.Sprintf("%.2f %s %s %s", cpuValue, email, agentName, agentType)}
	_ = writer.Write(row)
	writer.Flush() // Ensure data is written to disk immediately
}

func init() {
	rootCmd.AddCommand(startCmd)
	startCmd.Flags().BoolVar(&verbose, "verbose", false, "Run in foreground and print logs")
	startCmd.Flags().BoolVarP(&local, "local", "l", false, "Save metrics to CSV")
}
