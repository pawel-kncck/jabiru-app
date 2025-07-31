const { chromium } = require('playwright');

async function monitorPage() {
    let iteration = 1;
    const maxIterations = 10;
    
    while (iteration <= maxIterations) {
        console.log(`\n=== Iteration ${iteration}/${maxIterations} ===`);
        
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Capture console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Capture page errors
        const pageErrors = [];
        page.on('pageerror', error => {
            pageErrors.push(error.toString());
        });
        
        try {
            console.log('Navigating to http://localhost:5173/...');
            await page.goto('http://localhost:5173/', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            // Wait a bit more for the page to fully render
            await page.waitForTimeout(2000);
            
            // Check if page has a black screen by examining the body background
            const bodyStyle = await page.evaluate(() => {
                const body = document.body;
                const computedStyle = window.getComputedStyle(body);
                return {
                    backgroundColor: computedStyle.backgroundColor,
                    color: computedStyle.color,
                    hasContent: body.innerText.trim().length > 0,
                    childrenCount: body.children.length
                };
            });
            
            console.log('Page style analysis:', bodyStyle);
            console.log('Console errors:', consoleErrors);
            console.log('Page errors:', pageErrors);
            
            // Check for black screen indicators
            const isBlackScreen = (
                !bodyStyle.hasContent || 
                bodyStyle.childrenCount === 0 || 
                consoleErrors.length > 0 || 
                pageErrors.length > 0
            );
            
            if (isBlackScreen) {
                console.log('BLACK SCREEN DETECTED!');
                
                // Collect all error messages
                const allErrors = [...consoleErrors, ...pageErrors];
                
                await browser.close();
                
                if (allErrors.length > 0) {
                    console.log('Errors found, reporting to primary coding agent...');
                    return {
                        hasErrors: true,
                        errors: allErrors,
                        iteration: iteration
                    };
                } else {
                    console.log('Black screen detected but no console errors found');
                    return {
                        hasErrors: true,
                        errors: ['Black screen with no visible content or DOM elements'],
                        iteration: iteration
                    };
                }
            } else {
                console.log('Page appears to be loading correctly!');
                await browser.close();
                return {
                    hasErrors: false,
                    iteration: iteration
                };
            }
            
        } catch (error) {
            console.log('Navigation error:', error.message);
            await browser.close();
            return {
                hasErrors: true,
                errors: [error.message],
                iteration: iteration
            };
        }
    }
    
    return {
        hasErrors: true,
        errors: ['Maximum iterations reached without resolution'],
        iteration: maxIterations
    };
}

module.exports = { monitorPage };