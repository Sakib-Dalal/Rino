package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
	"github.com/olekukonko/tablewriter/renderer"
	"github.com/olekukonko/tablewriter/tw"
	"github.com/spf13/cobra"
)

// statusCmd represents the status command
var statusCmd = &cobra.Command{
	Use:   "status",
	Short: color.YellowString("Get the status of RIHNO agent logs and other..."),
	Run:   getStatus,
}

func getStatus(dmd *cobra.Command, args []string) {
	pidPath := filepath.Join(os.TempDir(), "rihno.pid")

	// Default values
	status := color.RedString("Stopped")
	pidStr := "N/A"
	uptime := "0s"
	logsCount := "0"

	data, err := os.ReadFile(pidPath)
	if err == nil {
		pidStr = string(data)
		pid, _ := strconv.Atoi(pidStr)

		// 2. Check if the process is actually running
		process, err := os.FindProcess(pid)
		// On Unix, FindProcess always succeeds, so we send signal 0 to check health
		if err == nil && process.Signal(syscall.Signal(0)) == nil {
			status = color.GreenString("Running")

			// 3. Calculate approximate logs (Uptime / 2 seconds)
			fileInfo, err := os.Stat(pidPath)
			if err == nil {
				duration := time.Since(fileInfo.ModTime())
				uptime = duration.Truncate(time.Second).String()
				// Calculation: 1 log every 2 seconds
				logsCount = strconv.FormatInt(int64(duration.Seconds()/2), 10)
			}
		} else {
			status = color.YellowString("Zombies/Stale (PID file exists but process dead)")
		}
	}

	// 1. Initialize Table using the modern API
	table := tablewriter.NewTable(os.Stdout,
		// Using the Rounded style for a professional look
		tablewriter.WithRenderer(renderer.NewBlueprint(tw.Rendition{
			Symbols: tw.NewSymbols(tw.StyleRounded),
		})),
		tablewriter.WithConfig(tablewriter.Config{
			Header: tw.CellConfig{
				Alignment: tw.CellAlignment{Global: tw.AlignCenter},
			},
			Row: tw.CellConfig{
				Alignment: tw.CellAlignment{Global: tw.AlignLeft},
			},
		}),
	)

	// 2. Set Header and Data
	table.Header([]string{"Metric", "Current Value"})

	table.Append([]string{"Agent Status", status})
	table.Append([]string{"Process ID", pidStr})
	table.Append([]string{"Total Uptime", uptime})
	table.Append([]string{"Logs Recorded", logsCount})
	table.Append([]string{"Config File", "~/.rihno.yaml"})

	// 3. Render
	fmt.Println(color.CyanString("\n--- RIHNO AGENT SYSTEM STATUS ---"))
	table.Render()
	fmt.Println()
}

func init() {
	rootCmd.AddCommand(statusCmd)
}
