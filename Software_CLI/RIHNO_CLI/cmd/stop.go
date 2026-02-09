package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

// stopCmd represents the stop command
var stopCmd = &cobra.Command{
	Use:   "stop",
	Short: color.YellowString("Stop the RIHNO agent"),
	Run: func(cmd *cobra.Command, args []string) {
		pidPath := filepath.Join(os.TempDir(), "rihno.pid")

		// 1. Read the PID from the file
		data, err := os.ReadFile(pidPath)
		if err != nil {
			fmt.Println(color.RedString("RIHNO agent is not running (no PID file found)."))
			return
		}

		pid, _ := strconv.Atoi(string(data))

		// 2. Find the process
		process, err := os.FindProcess(pid)
		if err != nil {
			fmt.Printf("Failed to find process: %v\n", err)
			return
		}

		// 3. Kill the process
		err = process.Signal(os.Interrupt) // Send Ctrl+C signal
		if err != nil {
			fmt.Printf("Failed to stop process: %v\n", err)
			return
		}

		// 4. Clean up the PID file
		os.Remove(pidPath)
		fmt.Println(color.GreenString("RIHNO agent (PID %d) stopped successfully.", pid))
	},
}

func init() {
	rootCmd.AddCommand(stopCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// stopCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// stopCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
